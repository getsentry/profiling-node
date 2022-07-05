// Bindings to v8 profiler
#include <unordered_map>

#include "nan.h"
#include "v8-profiler.h"

#define FORMAT_RAW 1
#define FORMAT_SAMPLED 2

#define PROFILER_FORMAT FORMAT_SAMPLED

using namespace v8;

// 1e5μs aka every 10ms
static int defaultSamplingIntervalMicroseconds = 10000;

// Isolate represents an instance of the v8 engine and can be entered at most by 1 thread at a given time
// https://v8docs.nodesource.com/node-0.8/d5/dda/classv8_1_1_isolate.html
CpuProfiler* cpuProfiler = NULL;

Local<Object> CreateFrameGraphNode(
    Local<String> name, Local<String> scriptName,
    Local<Integer> scriptId, Local<Integer> lineNumber,
    Local<Integer> columnNumber, Local<Integer> hitCount,
    Local<Array> children) {

  Local<Object> js_node = Nan::New<Object>();
  
  Nan::Set(js_node, Nan::New<String>("name").ToLocalChecked(), name);
  Nan::Set(js_node, Nan::New<String>("scriptName").ToLocalChecked(), scriptName);
  Nan::Set(js_node, Nan::New<String>("scriptId").ToLocalChecked(), scriptId);
  Nan::Set(js_node, Nan::New<String>("lineNumber").ToLocalChecked(), lineNumber);
  Nan::Set(js_node, Nan::New<String>("columnNumber").ToLocalChecked(), columnNumber);
  Nan::Set(js_node, Nan::New<String>("hitCount").ToLocalChecked(), hitCount);
  Nan::Set(js_node, Nan::New<String>("children").ToLocalChecked(), children);

  return js_node;
}

Local<Object> CreateFrameNode(
    Local<String> name, Local<String> scriptName,
    Local<Integer> scriptId, Local<Integer> lineNumber,
    Local<Integer> columnNumber) {

  Local<Object> js_node = Nan::New<Object>();
  
  Nan::Set(js_node, Nan::New<String>("name").ToLocalChecked(), name);
  Nan::Set(js_node, Nan::New<String>("scriptName").ToLocalChecked(), scriptName);
  Nan::Set(js_node, Nan::New<String>("scriptId").ToLocalChecked(), scriptId);
  Nan::Set(js_node, Nan::New<String>("lineNumber").ToLocalChecked(), lineNumber);
  Nan::Set(js_node, Nan::New<String>("columnNumber").ToLocalChecked(), columnNumber);

  return js_node;
};

std::tuple <Local<Value>, Local<Value>, Local<Value>> GetSamples(const CpuProfile* profile){
    unsigned int sampleCount = profile->GetSamplesCount();

    Local<v8::Array> samples = Nan::New<Array>(sampleCount);
    Local<v8::Array> sampleTimes = Nan::New<Array>(sampleCount);
    Local<v8::Array> frameIndex = Nan::New<Array>();

    unsigned int idx = 0;
    unsigned int previousTimestamp = profile->GetStartTime();
    std::unordered_map<std::string, int> frameLookup;

    for(unsigned int i = 0; i < sampleCount; i++) {
        const CpuProfileNode* node = profile->GetSample(i);
             v8::Isolate* isolate = Isolate::GetCurrent();

        int stackDepth = -1;
        auto startNode = node;
        // Count the number of frames in the stack so that we can insert them in reverse order.
        while(startNode != NULL) {
            stackDepth++;
            startNode = startNode->GetParent();
        }

        // A stack is a list of frames ordered from outermost to innermost frame
        Local<Array> stack = Nan::New<Array>(stackDepth-1);

        int tailOffset = 0;
        while(node != NULL) {
            auto functionName = node->GetFunctionName();
            int scriptId = node->GetScriptId();
            int line = node->GetLineNumber();
            int column = node->GetColumnNumber();

            v8::String::Utf8Value str(isolate, functionName);
            std::string cppStr(*str);

            auto index = frameLookup.find(cppStr);

            if(index == frameLookup.end()) {
                frameLookup.insert({cppStr, idx});

                Nan::Set(stack, stackDepth - tailOffset, Nan::New<Number>(idx));
                Nan::Set(frameIndex, idx, CreateFrameNode(
                    functionName,
                    node->GetScriptResourceName(),
                    Nan::New<Integer>(scriptId),
                    Nan::New<Integer>(line),
                    Nan::New<Integer>(column))
                );
                idx++;
            } else {
                Nan::Set(stack, stackDepth - tailOffset, Nan::New<Number>(index->second));
            }

            node = node->GetParent();
            tailOffset++;
        }

        int sampleTimestamp = profile->GetSampleTimestamp(i);

        Nan::Set(samples, i, stack);

        // Timestamps are expressed in microseconds
        Nan::Set(sampleTimes, i, Nan::New<Number>(sampleTimestamp - previousTimestamp));

        previousTimestamp = sampleTimestamp;

    }

    return std::make_tuple(samples, sampleTimes, frameIndex);
}


Local<Value> CreateFrameGraph(const CpuProfileNode* node) {
  int32_t count = node->GetChildrenCount();
  Local<Array> children = Nan::New<Array>(count);
  for (int32_t i = 0; i < count; i++) {
    Nan::Set(children, i, CreateFrameGraph(node->GetChild(i)));
  }

  return CreateFrameGraphNode(
        node->GetFunctionName(),
        node->GetScriptResourceName(), 
        Nan::New<Integer>(node->GetScriptId()),
        Nan::New<Integer>(node->GetLineNumber()),
        Nan::New<Integer>(node->GetColumnNumber()),
        Nan::New<Integer>(node->GetHitCount()),
        children
    );
}

Local<Value> CreateProfile(const CpuProfile* profile, bool includeLineInfo) {
  Local<Object> js_profile = Nan::New<Object>();

  v8::Isolate* isolate = v8::Isolate::GetCurrent();


  Nan::Set(js_profile, Nan::New<String>("title").ToLocalChecked(), profile->GetTitle());
  Nan::Set(js_profile, Nan::New<String>("startValue").ToLocalChecked(), Nan::New<Number>(profile->GetStartTime()));
  Nan::Set(js_profile, Nan::New<String>("endValue").ToLocalChecked(), Nan::New<Number>(profile->GetEndTime()));
  Nan::Set(js_profile, Nan::New<String>("type").ToLocalChecked(), Nan::New<String>("sampled").ToLocalChecked());
  Nan::Set(js_profile, Nan::New<String>("threadID").ToLocalChecked(), Nan::New<Number>(10));

#if PROFILER_FORMAT == FORMAT_SAMPLED
  std::tuple<Local<Value>, Local<Value>, Local<Value>> samples = GetSamples(profile);
  Nan::Set(js_profile, Nan::New<String>("samples").ToLocalChecked(), std::get<0>(samples));
  Nan::Set(js_profile, Nan::New<String>("weights").ToLocalChecked(), std::get<1>(samples));
  Nan::Set(js_profile, Nan::New<String>("frames").ToLocalChecked(), std::get<2>(samples));
#elif PROFILER_FORMAT == FORMAT_RAW
  Nan::Set(js_profile, Nan::New<String>("topDownRoot").ToLocalChecked(), CreateFrameGraph(profile->GetTopDownRoot()));
#endif
  return js_profile;
}

// StartProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aedf6a5ca49432ab665bc3a1ccf46cca4
NAN_METHOD(StartProfiling) {
    if (cpuProfiler) {
        return Nan::ThrowError("CPU profiler is already started.");
    };

    if(!info[0]->IsString()) {
        return Nan::ThrowError("StartProfiling requires a string as the first argument.");
    }

    int customOrDefaultSamplingInterval = defaultSamplingIntervalMicroseconds;

    if(info[1]->IsNumber()) {
        customOrDefaultSamplingInterval = info[1]->ToInteger(v8::Local<v8::Context>()).ToLocalChecked()->Value();
    }

    cpuProfiler = CpuProfiler::New(v8::Isolate::GetCurrent());
    cpuProfiler->SetSamplingInterval(customOrDefaultSamplingInterval);
    cpuProfiler->SetUsePreciseSampling(false);
    cpuProfiler->StartProfiling(Nan::To<v8::String>(info[0]).ToLocalChecked(), true);
};

// StopProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#a40ca4c8a8aa4c9233aa2a2706457cc80
NAN_METHOD(StopProfiling) {
    if (!cpuProfiler) {
        return Nan::ThrowError("CPU profiler is not started.");
    };

    v8::Local<v8::String> title = Nan::To<v8::String>(info[0]).ToLocalChecked();
    v8::CpuProfile *profile = cpuProfiler->StopProfiling(title);

    info.GetReturnValue().Set(CreateProfile(profile, false));

    cpuProfiler->Dispose();
    cpuProfiler = NULL;
};

// SetUsePreciseSampling(bool use_precise_sampling)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aec3784308a2ee6da56954926a90b60af
NAN_METHOD(SetUsePreciseSampling){
    if (cpuProfiler) {
        return Nan::ThrowError("SetUsePreciseSampling is not supported when CPU profiler is already started.");
    };

    if(info[0].IsEmpty()) {
        return Nan::ThrowError("SetUsePreciseSampling expects a boolean as first argument.");
    };

    if(!info[0]->IsBoolean()) {
        return Nan::ThrowError("SetUsePreciseSampling expects a boolean as first argument.");
    };

    cpuProfiler->SetUsePreciseSampling(info[0].As<Boolean>()->Value());
};

// SetSamplingInterval(int us)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aa652c07923bf6e1a4962653cf09dceb1
NAN_METHOD(SetSamplingInterval) {
    if (cpuProfiler) {
        return Nan::ThrowError("SetSamplingInterval is not supported when CPU profiler is already started.");
    };

    if(info[0].IsEmpty()) {
        return Nan::ThrowError("SetSamplingInterval expects a number as the first argument.");
    }

    if(!info[0]->IsNumber()) {
        return Nan::ThrowError("SetSamplingInterval expects a number as the first argument.");
    }

    int us = info[0].As<Integer>()->Value();
    cpuProfiler->SetSamplingInterval(us);
}

void Init(v8::Local<v8::Object> exports) {
  v8::Local<v8::Context> context = exports->GetCreationContext().ToLocalChecked();
  
  exports->Set(context, Nan::New("startProfiling").ToLocalChecked(),
               Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StartProfiling)).ToLocalChecked());

  exports->Set(context, Nan::New("setSamplingInterval").ToLocalChecked(),
               Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SetSamplingInterval)).ToLocalChecked());
               
  exports->Set(context, Nan::New("setUsePreciseSampling").ToLocalChecked(),
               Nan::GetFunction(Nan::New<v8::FunctionTemplate>(SetUsePreciseSampling)).ToLocalChecked());

  exports->Set(context, Nan::New("stopProfiling").ToLocalChecked(),
               Nan::GetFunction(Nan::New<v8::FunctionTemplate>(StopProfiling)).ToLocalChecked());

  exports->Set(context, Nan::New("format").ToLocalChecked(), Nan::New<Integer>(PROFILER_FORMAT));
}

NODE_MODULE(cpu_profiler, Init);