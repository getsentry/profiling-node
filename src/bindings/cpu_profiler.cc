// Bindings to v8 profiler
#include <unordered_map>

#include "nan.h"
#include "v8-profiler.h"
#include "iostream"

#define FORMAT_SAMPLED 2
#define FORMAT_RAW 1

#ifndef PROFILER_FORMAT 
#define PROFILER_FORMAT FORMAT_SAMPLED
#endif

#ifndef FORMAT_BENCHMARK
#define FORMAT_BENCHMARK 0
#endif

using namespace v8;
using namespace std;

// 1e5 us aka every 10ms
// static int defaultSamplingIntervalMicroseconds = 1e5;

// Isolate represents an instance of the v8 engine and can be entered at most by 1 thread at a given time
// https://v8docs.nodesource.com/node-0.8/d5/dda/classv8_1_1_isolate.html
CpuProfiler* cpuProfiler = CpuProfiler::New(Isolate::GetCurrent(), kDebugNaming, kLazyLogging);

#if PROFILER_FORMAT == FORMAT_RAW || FORMAT_BENCHMARK == 1
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
};

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
};
#endif

#if PROFILER_FORMAT == FORMAT_SAMPLED || FORMAT_BENCHMARK == 1
Local<Object> CreateSampleFrameNode(
    Local<String> name, Local<String> scriptName,
    Local<Integer> scriptId, Local<Integer> lineNumber,
    Local<Integer> columnNumber, std::vector<CpuProfileDeoptInfo> deoptInfos) {

  Local<Object> js_node = Nan::New<Object>();
  
  Nan::Set(js_node, Nan::New<String>("name").ToLocalChecked(), name);
  Nan::Set(js_node, Nan::New<String>("scriptName").ToLocalChecked(), scriptName);
  Nan::Set(js_node, Nan::New<String>("scriptId").ToLocalChecked(), scriptId);
  Nan::Set(js_node, Nan::New<String>("lineNumber").ToLocalChecked(), lineNumber);
  Nan::Set(js_node, Nan::New<String>("columnNumber").ToLocalChecked(), columnNumber);

  size_t size = deoptInfos.size();

  if(size > 0) {
    Local<Array> deoptReasons = Nan::New<Array>(size);
    
    for(size_t i = 0; i < size; i++) {
      Nan::Set(deoptReasons, i, Nan::New<String>(deoptInfos[i].deopt_reason).ToLocalChecked());
    }

    Nan::Set(js_node, Nan::New<String>("deoptReasons").ToLocalChecked(), deoptReasons);
  };

  return js_node;
};

std::tuple <Local<Value>, Local<Value>, Local<Value>> GetSamples(const CpuProfile* profile) {
    int sampleCount = profile->GetSamplesCount();
    std::unordered_map<std::string, int> frameLookupTable;

    Local<Array> samples = Nan::New<Array>(sampleCount);
    Local<Array> weights = Nan::New<Array>(sampleCount);
    Local<Array> frameIndex = Nan::New<Array>();

    Isolate* isolate = Isolate::GetCurrent();
    int64_t previousTimestamp = profile->GetStartTime();

    uint32_t idx = 0;
    for(uint32_t i = 0; i < sampleCount; i++) {
        const CpuProfileNode* node = profile->GetSample(i);
        const v8::CpuProfileNode * startNode = node;

        uint32_t stackDepth = -1;
        // Count the number of frames in the stack so that we can insert them in reverse order.
        while(startNode != nullptr) {
            stackDepth++;
            startNode = startNode->GetParent();
        };

        // A stack is a list of frames ordered from outermost to innermost frame
        Local<Array> stack = Nan::New<Array>(stackDepth-1);
        uint32_t tailOffset = 0;

        while(node != nullptr) {
            Local<String> functionName = node->GetFunctionName();
            String::Utf8Value str(isolate, functionName);
            std::string cppStr(*str);

            int scriptId = node->GetScriptId();
            auto index = frameLookupTable.find(cppStr);
            auto deoptReason = node->GetDeoptInfos();

            if(index == frameLookupTable.end()) {
                frameLookupTable.insert({cppStr, idx});

                Nan::Set(stack, stackDepth - tailOffset, Nan::New<Number>(idx));
                Nan::Set(frameIndex, idx, CreateSampleFrameNode(
                    functionName,
                    node->GetScriptResourceName(),
                    Nan::New<Integer>(scriptId),
                    Nan::New<Integer>(node->GetLineNumber()),
                    Nan::New<Integer>(node->GetColumnNumber()),
                    deoptReason
                ));
                idx++;
            } else {
                Nan::Set(stack, stackDepth - tailOffset, Nan::New<Number>(index->second));
            };

            node = node->GetParent();
            tailOffset++;
        }

        int64_t sampleTimestamp = profile->GetSampleTimestamp(i);

        Nan::Set(samples, i, stack);
        Nan::Set(weights, i, Nan::New<Number>(sampleTimestamp - previousTimestamp));

        previousTimestamp = sampleTimestamp;

    };

    return std::make_tuple(samples, weights, frameIndex);
};
#endif

Local<Value> CreateProfile(const CpuProfile* profile) {
  Local<Object> js_profile = Nan::New<Object>();

  Nan::Set(js_profile, Nan::New<String>("title").ToLocalChecked(), profile->GetTitle());
  Nan::Set(js_profile, Nan::New<String>("startValue").ToLocalChecked(), Nan::New<Number>(profile->GetStartTime()));
  Nan::Set(js_profile, Nan::New<String>("endValue").ToLocalChecked(), Nan::New<Number>(profile->GetEndTime()));
  Nan::Set(js_profile, Nan::New<String>("type").ToLocalChecked(), Nan::New<String>("sampled").ToLocalChecked());
  Nan::Set(js_profile, Nan::New<String>("threadID").ToLocalChecked(), Nan::New<Number>(10));
  Nan::Set(js_profile, Nan::New<String>("unit").ToLocalChecked(), Nan::New<String>("microseconds").ToLocalChecked());
  Nan::Set(js_profile, Nan::New<String>("duration_ns").ToLocalChecked(), Nan::New<Number>((profile->GetEndTime() - profile->GetStartTime()) * 1e3));

#if PROFILER_FORMAT == FORMAT_SAMPLED || FORMAT_BENCHMARK == 1
  std::tuple<Local<Value>, Local<Value>, Local<Value>> samples = GetSamples(profile);
  Nan::Set(js_profile, Nan::New<String>("samples").ToLocalChecked(), std::get<0>(samples));
  Nan::Set(js_profile, Nan::New<String>("weights").ToLocalChecked(), std::get<1>(samples));
  Nan::Set(js_profile, Nan::New<String>("frames").ToLocalChecked(), std::get<2>(samples));
#endif
#if PROFILER_FORMAT == FORMAT_RAW || FORMAT_BENCHMARK == 1
  Nan::Set(js_profile, Nan::New<String>("topDownRoot").ToLocalChecked(), CreateFrameGraph(profile->GetTopDownRoot()));
#endif
  return js_profile;
};

// StartProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aedf6a5ca49432ab665bc3a1ccf46cca4
NAN_METHOD(StartProfiling) {
  if(info[0].IsEmpty()) {
        return Nan::ThrowError("StartProfiling expects a string as first argument.");
    };

    if(!info[0]->IsString()) {
        return Nan::ThrowError("StartProfiling requires a string as the first argument.");
    };

    // int customOrDefaultSamplingInterval = defaultSamplingIntervalMicroseconds;
    bool recordSamples = true;

    // if(info[1]->IsNumber()) {
    //     customOrDefaultSamplingInterval = info[1]->ToInteger(Local<Context>()).ToLocalChecked()->Value();
    // }

    // cpuProfiler->SetSamplingInterval(customOrDefaultSamplingInterval);
    cpuProfiler->SetUsePreciseSampling(true);
    cpuProfiler->StartProfiling(Nan::To<String>(info[0]).ToLocalChecked(), recordSamples);
};

// StopProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#a40ca4c8a8aa4c9233aa2a2706457cc80
NAN_METHOD(StopProfiling) {
    if(info[0].IsEmpty()) {
        return Nan::ThrowError("StopProfiling expects a string as first argument.");
    };

    if(!info[0]->IsString()) {
        return Nan::ThrowError("StopProfiling expects a string as first argument.");
    };

    CpuProfile *profile = cpuProfiler->StopProfiling(Nan::To<String>(info[0]).ToLocalChecked());

    if(profile == nullptr) {
      return Nan::ThrowError("StopProfiling failed to stop the profile.");
    };

    info.GetReturnValue().Set(CreateProfile(profile));
    profile->Delete();
};

// SetUsePreciseSampling(bool use_precise_sampling)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aec3784308a2ee6da56954926a90b60af
NAN_METHOD(SetUsePreciseSampling){
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
    if(info[0].IsEmpty()) {
        return Nan::ThrowError("SetSamplingInterval expects a number as the first argument.");
    };

    if(!info[0]->IsNumber()) {
        return Nan::ThrowError("SetSamplingInterval expects a number as the first argument.");
    };

    int us = info[0].As<Integer>()->Value();
    cpuProfiler->SetSamplingInterval(us);
}

void Initialize(Local<Object> exports) {
  Nan::SetMethod(exports, "startProfiling", StartProfiling);
  Nan::SetMethod(exports, "setSamplingInterval", SetSamplingInterval);
  Nan::SetMethod(exports, "setUsePreciseSampling", SetUsePreciseSampling);
  Nan::SetMethod(exports, "stopProfiling", StopProfiling);
};

NODE_MODULE(cpu_profiler, Initialize);