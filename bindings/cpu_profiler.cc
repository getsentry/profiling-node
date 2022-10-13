
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

// Isolate represents an instance of the v8 engine and can be entered at most by 1 thread at a given time.
// The Profiler is a context aware class that is bound to an isolate. This allows us to profile multiple isolates 
// at the same time and avoid segafaults when profiling multiple threads.
// https://nodejs.org/api/addons.html.

static const uint8_t MAX_STACK_DEPTH = 128;
static const uint8_t SAMPLING_FREQUENCY = 99; // 99 to avoid lockstep sampling
static const uint32_t SAMPLING_INTERVAL_US = 1 / SAMPLING_FREQUENCY * 1e6;

class Profiler {
  public: 
    explicit Profiler(Isolate* isolate):
      // I attempted to make this initializer lazy as I wrongly assumed that it is the initializer step that is adding overhead,
      // however after doing that and measuring the overhead I realized that it is in fact caused by the first call to startProfiling.
      // This is only true when kLazyLogging is true, when kLazyLogging is false then init is fairly fast.
      cpu_profiler (CpuProfiler::New(isolate, v8::CpuProfilingNamingMode::kDebugNaming, v8::CpuProfilingLoggingMode::kLazyLogging)) {
        node::AddEnvironmentCleanupHook(isolate, DeleteInstance, this);
      }

  CpuProfiler* cpu_profiler;

  static void DeleteInstance(void* data) {
    Profiler* profiler = static_cast<Profiler*>(data);
    profiler->cpu_profiler->Dispose();
    delete profiler;
  }
};

#if PROFILER_FORMAT == FORMAT_RAW || FORMAT_BENCHMARK == 1
Local<Object> CreateFrameGraphNode(
    Local<String> name, Local<String> scriptName,
    Local<Integer> scriptId, Local<Integer> lineNumber,
    Local<Integer> columnNumber, Local<Integer> hitCount,
    Local<Array> children) {

  Local<Object> js_node = Nan::New<Object>();
  
  Nan::Set(js_node, Nan::New<String>("name").ToLocalChecked(), name);
  Nan::Set(js_node, Nan::New<String>("file").ToLocalChecked(), scriptName);
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
Local<Object> CreateFrameNode(
    Local<String> name, Local<String> scriptName, Local<Integer> line,
    Local<Integer> column, std::vector<CpuProfileDeoptInfo> deoptInfos) {

  Local<Object> js_node = Nan::New<Object>();
  
  Nan::Set(js_node, Nan::New<String>("name").ToLocalChecked(), name);
  Nan::Set(js_node, Nan::New<String>("file").ToLocalChecked(), scriptName);
  Nan::Set(js_node, Nan::New<String>("line").ToLocalChecked(), line);
  Nan::Set(js_node, Nan::New<String>("column").ToLocalChecked(), column);

  // @TODO Deopt info needs to be added to backend
  // size_t size = deoptInfos.size();

  // if(size > 0) {
  //   Local<Array> deoptReasons = Nan::New<Array>(size);
    
  //   for(size_t i = 0; i < size; i++) {
  //     Nan::Set(deoptReasons, i, Nan::New<String>(deoptInfos[i].deopt_reason).ToLocalChecked());
  //   }

  //   Nan::Set(js_node, Nan::New<String>("deopt_reasons").ToLocalChecked(), deoptReasons);
  // };

  return js_node;
};


Local<Object> CreateSample(uint32_t stack_id, uint32_t sample_timestamp_us, uint32_t thread_id) {
  Local<Object> js_node = Nan::New<Object>();

  Nan::Set(js_node, Nan::New<String>("stack_id").ToLocalChecked(), Nan::New<Number>(stack_id));
  Nan::Set(js_node, Nan::New<String>("thread_id").ToLocalChecked(), Nan::New<String>(std::to_string(thread_id)).ToLocalChecked());
  Nan::Set(js_node, Nan::New<String>("elapsed_since_start_ns").ToLocalChecked(), Nan::New<Number>(sample_timestamp_us * 1000));

  return js_node;
};

std::tuple <Local<Value>, Local<Value>, Local<Value>> GetSamples(const CpuProfile* profile, uint32_t thread_id) {
    const uint32_t profile_start_time_us = profile->GetStartTime();
    const int sampleCount = profile->GetSamplesCount();

    uint32_t unique_frame_id = 0;
    std::unordered_map<uint32_t, uint32_t> frameLookupTable;

    Local<Array> stacks = Nan::New<Array>(sampleCount);
    Local<Array> samples = Nan::New<Array>(sampleCount);
    Local<Array> frames = Nan::New<Array>();

    for(int i = 0; i < sampleCount; i++) {
        const Local<Value> sample = CreateSample(i, profile->GetSampleTimestamp(i) - profile_start_time_us, thread_id);
        const CpuProfileNode* node = profile->GetSample(i);
        // A stack is a list of frames ordered from outermost (top) to innermost frame (bottom)
        Local<Array> stack = Nan::New<Array>();
        uint32_t stack_depth = 0;

        while(node != nullptr && stack_depth < MAX_STACK_DEPTH) {
            const uint32_t nodeId = node->GetNodeId();
            auto frame_index = frameLookupTable.find(nodeId);
            auto deoptReason = node->GetDeoptInfos();

            // If the frame does not exist in the index
            if(frame_index == frameLookupTable.end()) {
                frameLookupTable.insert({nodeId, unique_frame_id});

                Nan::Set(stack, stack_depth, Nan::New<Number>(unique_frame_id));
                Nan::Set(frames, unique_frame_id, CreateFrameNode(
                    node->GetFunctionName(),
                    node->GetScriptResourceName(),
                    Nan::New<Integer>(node->GetLineNumber()),
                    Nan::New<Integer>(node->GetColumnNumber()),
                    deoptReason
                ));
                unique_frame_id++;
            } else {
              // If it was already indexed, just add it's id to the stack
                Nan::Set(stack, stack_depth, Nan::New<Number>(frame_index->second));
            };
      
            // Continue walking down the stack
            node = node->GetParent();
            stack_depth++;
        }

        Nan::Set(stacks, i, stack);
        Nan::Set(samples, i, sample);
    };

    return std::make_tuple(stacks, samples, frames);
};
#endif

Local<Value> CreateProfile(const CpuProfile* profile, uint32_t thread_id) {
  Local<Object> js_profile = Nan::New<Object>();

  Nan::Set(js_profile, Nan::New<String>("profile_relative_started_at_ns").ToLocalChecked(), Nan::New<Number>(profile->GetStartTime() * 1000));
  Nan::Set(js_profile, Nan::New<String>("profile_relative_ended_at_ns").ToLocalChecked(), Nan::New<Number>(profile->GetEndTime() * 1000));

#if PROFILER_FORMAT == FORMAT_SAMPLED || FORMAT_BENCHMARK == 1
  std::tuple<Local<Value>, Local<Value>, Local<Value>> samples = GetSamples(profile, thread_id);
  Nan::Set(js_profile, Nan::New<String>("stacks").ToLocalChecked(), std::get<0>(samples));
  Nan::Set(js_profile, Nan::New<String>("samples").ToLocalChecked(), std::get<1>(samples));
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
    profiler->cpu_profiler->StartProfiling(Nan::To<String>(args[0]).ToLocalChecked(), true);
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

    if(args[1].IsEmpty()) {
        return Nan::ThrowError("StopProfiling expects a number as second argument.");
    };

    if(!args[1]->IsNumber()){
        return Nan::ThrowError("StopProfiling expects a thread_id of type number as second argument.");
    };


    Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<External>()->Value());
    CpuProfile* profile = profiler->cpu_profiler->StopProfiling(Nan::To<String>(args[0]).ToLocalChecked());

    // If for some reason stopProfiling was called with an invalid profile title or
    // if that title had somehow been stopped already, profile will be null.
    if(profile == nullptr) {
      args.GetReturnValue().Set(Nan::Null());
      return;
    };

    args.GetReturnValue().Set(CreateProfile(profile, Nan::To<uint32_t>(args[1]).FromJust()));
    profile->Delete();
};

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
}