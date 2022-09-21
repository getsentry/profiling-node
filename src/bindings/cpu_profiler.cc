
#include <unordered_map>

#include "nan.h"
#include "node.h"
#include "v8-profiler.h"

#define FORMAT_SAMPLED 2
#define FORMAT_RAW 1

#ifndef PROFILER_FORMAT 
#define PROFILER_FORMAT FORMAT_SAMPLED
#endif

#ifndef FORMAT_BENCHMARK
#define FORMAT_BENCHMARK 0
#endif

using namespace v8;

// 1e5 us aka every 10ms
// static int defaultSamplingIntervalMicroseconds = 1e5;

// Isolate represents an instance of the v8 engine and can be entered at most by 1 thread at a given time.
// The Profiler is a context aware class that is bound to an isolate. This allows us to profile multiple isolates 
// at the same time and avoid segafaults when profiling multiple threads.
// https://nodejs.org/api/addons.html.
class Profiler {
  public: 
    explicit Profiler(Isolate* isolate):
      cpu_profiler (CpuProfiler::New(isolate, kDebugNaming, kLazyLogging)) {
        // Ensure this per-addon-instance data is deleted at environment cleanup.
        // node::AddEnvironmentCleanupHook(isolate, Cleanup, this);
      }
  CpuProfiler* cpu_profiler;
};

#if PROFILER_FORMAT == FORMAT_RAW || FORMAT_BENCHMARK == 1
Local<Object> CreateFrameGraphNode(
    Local<String> name, Local<String> scriptName,
    Local<Integer> scriptId, Local<Integer> lineNumber,
    Local<Integer> columnNumber, Local<Integer> hitCount,
    Local<Array> children) {

  Local<Object> js_node = Nan::New<Object>();
  
  Nan::Set(js_node, Nan::New<String>("name").ToLocalChecked(), name);
  Nan::Set(js_node, Nan::New<String>("script_name").ToLocalChecked(), scriptName);
  Nan::Set(js_node, Nan::New<String>("script_id").ToLocalChecked(), scriptId);
  Nan::Set(js_node, Nan::New<String>("line_number").ToLocalChecked(), lineNumber);
  Nan::Set(js_node, Nan::New<String>("column_number").ToLocalChecked(), columnNumber);
  Nan::Set(js_node, Nan::New<String>("hit_count").ToLocalChecked(), hitCount);
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
  Nan::Set(js_node, Nan::New<String>("script_name").ToLocalChecked(), scriptName);
  Nan::Set(js_node, Nan::New<String>("script_id").ToLocalChecked(), scriptId);
  Nan::Set(js_node, Nan::New<String>("line_number").ToLocalChecked(), lineNumber);
  Nan::Set(js_node, Nan::New<String>("column_number").ToLocalChecked(), columnNumber);

  size_t size = deoptInfos.size();

  if(size > 0) {
    Local<Array> deoptReasons = Nan::New<Array>(size);
    
    for(size_t i = 0; i < size; i++) {
      Nan::Set(deoptReasons, i, Nan::New<String>(deoptInfos[i].deopt_reason).ToLocalChecked());
    }

    Nan::Set(js_node, Nan::New<String>("deopt_reasons").ToLocalChecked(), deoptReasons);
  };

  return js_node;
};

std::tuple <Local<Value>, Local<Value>, Local<Value>> GetSamples(const CpuProfile* profile) {
    int sampleCount = profile->GetSamplesCount();
    std::unordered_map<std::string, int> frameLookupTable;
    Isolate* isolate = Isolate::GetCurrent();

    Local<Array> samples = Nan::New<Array>(sampleCount);
    Local<Array> weights = Nan::New<Array>(sampleCount);
    Local<Array> frameIndex = Nan::New<Array>();

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
  Nan::Set(js_profile, Nan::New<String>("start_value").ToLocalChecked(), Nan::New<Number>(profile->GetStartTime()));
  Nan::Set(js_profile, Nan::New<String>("end_value").ToLocalChecked(), Nan::New<Number>(profile->GetEndTime()));
  Nan::Set(js_profile, Nan::New<String>("type").ToLocalChecked(), Nan::New<String>("sampled").ToLocalChecked());
  Nan::Set(js_profile, Nan::New<String>("thread_id").ToLocalChecked(), Nan::EmptyString());
  Nan::Set(js_profile, Nan::New<String>("unit").ToLocalChecked(), Nan::New<String>("microseconds").ToLocalChecked());
  Nan::Set(js_profile, Nan::New<String>("duration_ns").ToLocalChecked(), Nan::New<Number>((profile->GetEndTime() - profile->GetStartTime()) * 1e3));

#if PROFILER_FORMAT == FORMAT_SAMPLED || FORMAT_BENCHMARK == 1
  std::tuple<Local<Value>, Local<Value>, Local<Value>> samples = GetSamples(profile);
  Nan::Set(js_profile, Nan::New<String>("samples").ToLocalChecked(), std::get<0>(samples));
  Nan::Set(js_profile, Nan::New<String>("weights").ToLocalChecked(), std::get<1>(samples));
  Nan::Set(js_profile, Nan::New<String>("frames").ToLocalChecked(), std::get<2>(samples));
#endif
#if PROFILER_FORMAT == FORMAT_RAW || FORMAT_BENCHMARK == 1
  Nan::Set(js_profile, Nan::New<String>("top_down_root").ToLocalChecked(), CreateFrameGraph(profile->GetTopDownRoot()));
#endif
  return js_profile;
};

// StartProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aedf6a5ca49432ab665bc3a1ccf46cca4
static void StartProfiling(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if(args[0].IsEmpty()) {
        return Nan::ThrowError("StartProfiling expects a string as first argument.");
    };

    if(!args[0]->IsString()) {
        return Nan::ThrowError("StartProfiling requires a string as the first argument.");
    };

    Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<External>()->Value());
    // int customOrDefaultSamplingInterval = defaultSamplingIntervalMicroseconds;
    bool recordSamples = true;

    // if(info[1]->IsNumber()) {
    //     customOrDefaultSamplingInterval = info[1]->ToInteger(Local<Context>()).ToLocalChecked()->Value();
    // }

    // cpuProfiler->SetSamplingInterval(customOrDefaultSamplingInterval);
    profiler->cpu_profiler->SetUsePreciseSampling(true);
    profiler->cpu_profiler->StartProfiling(Nan::To<String>(args[0]).ToLocalChecked(), recordSamples);
};

// StopProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#a40ca4c8a8aa4c9233aa2a2706457cc80
static void StopProfiling(const v8::FunctionCallbackInfo<v8::Value>& args) {
    if(args[0].IsEmpty()) {
        return Nan::ThrowError("StopProfiling expects a string as first argument.");
    };

    if(!args[0]->IsString()) {
        return Nan::ThrowError("StopProfiling expects a string as first argument.");
    };

    Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<External>()->Value());
    CpuProfile* profile = profiler->cpu_profiler->StopProfiling(Nan::To<String>(args[0]).ToLocalChecked());

    args.GetReturnValue().Set(CreateProfile(profile));
    profile->Delete();
};

// // SetUsePreciseSampling(bool use_precise_sampling)
// // https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aec3784308a2ee6da56954926a90b60af
static void SetUsePreciseSampling(const v8::FunctionCallbackInfo<v8::Value>& args) {
    if(args[0].IsEmpty()) {
        return Nan::ThrowError("SetUsePreciseSampling expects a boolean as first argument.");
    };

    if(!args[0]->IsBoolean()) {
        return Nan::ThrowError("SetUsePreciseSampling expects a boolean as first argument.");
    };

    Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<External>()->Value());
    profiler->cpu_profiler->SetUsePreciseSampling(args[0].As<Boolean>()->Value());
};

// // SetSamplingInterval(int us)
// // https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aa652c07923bf6e1a4962653cf09dceb1
static void SetSamplingInterval(const v8::FunctionCallbackInfo<v8::Value>& args) {
    if(args[0].IsEmpty()) {
        return Nan::ThrowError("SetSamplingInterval expects a number as the first argument.");
    };

    if(!args[0]->IsNumber()) {
        return Nan::ThrowError("SetSamplingInterval expects a number as the first argument.");
    };

    Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<External>()->Value());
    profiler->cpu_profiler->SetSamplingInterval(args[0].As<Integer>()->Value());
}

NODE_MODULE_INIT(/* exports, module, context */){
  Isolate* isolate = context->GetIsolate();
  Profiler* profiler = new Profiler(isolate);
  Local<External> external = External::New(isolate, profiler);

  exports->Set(context, 
               Nan::New<String>("startProfiling").ToLocalChecked(),
               FunctionTemplate::New(isolate, StartProfiling, external)->GetFunction(context).ToLocalChecked()).FromJust();
  exports->Set(context, 
               Nan::New<String>("stopProfiling").ToLocalChecked(),
               FunctionTemplate::New(isolate, StopProfiling, external)->GetFunction(context).ToLocalChecked()).FromJust();
  exports->Set(context, 
               Nan::New<String>("setSamplingInterval").ToLocalChecked(),
               FunctionTemplate::New(isolate, SetSamplingInterval, external)->GetFunction(context).ToLocalChecked()).FromJust();
  exports->Set(context, 
               Nan::New<String>("setUsePreciseSampling").ToLocalChecked(),
               FunctionTemplate::New(isolate, SetUsePreciseSampling, external)->GetFunction(context).ToLocalChecked()).FromJust();
}