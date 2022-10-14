
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

// Isolate represents an instance of the v8 engine and can be entered at most by 1 thread at a given time.
// The Profiler is a context aware class that is bound to an isolate. This allows us to profile multiple isolates 
// at the same time and avoid segafaults when profiling multiple threads.
// https://nodejs.org/api/addons.html.

static const uint8_t MAX_STACK_DEPTH = 128;
static const float SAMPLING_FREQUENCY = 99.0; // 99 to avoid lockstep sampling
static const float SAMPLING_HZ = 1 / SAMPLING_FREQUENCY;
static const int SAMPLING_INTERVAL_US = static_cast<int>(SAMPLING_HZ * 1e6);

class Profiler {
  public: 
    explicit Profiler(v8::Isolate* isolate):
      // I attempted to make this initializer lazy as I wrongly assumed that it is the initializer step that is adding overhead,
      // however after doing that and measuring the overhead I realized that it is in fact caused by the first call to startProfiling.
      // This is only true when kLazyLogging is true, when kLazyLogging is false then init is fairly fast.
      cpu_profiler (v8::CpuProfiler::New(isolate, v8::CpuProfilingNamingMode::kDebugNaming, v8::CpuProfilingLoggingMode::kLazyLogging)) {
        node::AddEnvironmentCleanupHook(isolate, DeleteInstance, this);
      }

  v8::CpuProfiler* cpu_profiler;

  static void DeleteInstance(void* data) {
    Profiler* profiler = static_cast<Profiler*>(data);
    profiler->cpu_profiler->Dispose();
    delete profiler;
  }
};

//***************************************************************************
// C++ to JS translation helpers
//***************************************************************************
#if PROFILER_FORMAT == FORMAT_RAW || FORMAT_BENCHMARK == 1
Local<v8::Object> CreateFrameGraphNode(
    Local<v8::String> name, Local<v8::String> scriptName,
    Local<v8::Integer> scriptId, Local<v8::Integer> lineNumber,
    Local<v8::Integer> columnNumber, Local<v8::Integer> hitCount,
    Local<v8::Array> children) {

  Local<v8::Object> js_node = Nan::New<v8::Object>();
  
  Nan::Set(js_node, Nan::New<v8::String>("name").ToLocalChecked(), name);
  Nan::Set(js_node, Nan::New<v8::String>("file").ToLocalChecked(), scriptName);
  Nan::Set(js_node, Nan::New<v8::String>("script_id").ToLocalChecked(), scriptId);
  Nan::Set(js_node, Nan::New<v8::String>("line_number").ToLocalChecked(), lineNumber);
  Nan::Set(js_node, Nan::New<v8::String>("column_number").ToLocalChecked(), columnNumber);
  Nan::Set(js_node, Nan::New<v8::String>("hit_count").ToLocalChecked(), hitCount);
  Nan::Set(js_node, Nan::New<v8::String>("children").ToLocalChecked(), children);

  return js_node;
};

Local<Value> CreateFrameGraph(const CpuProfileNode* node) {
  int32_t count = node->GetChildrenCount();
  Local<v8::Array> children = Nan::New<v8::Array>(count);
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
v8::Local<v8::Object> CreateFrameNode(
    v8::Local<v8::String> name, v8::Local<v8::String> scriptName, v8::Local<v8::Integer> line,
    v8::Local<v8::Integer> column, std::vector<v8::CpuProfileDeoptInfo> deoptInfos) {

  v8::Local<v8::Object> js_node = Nan::New<v8::Object>();
  
  Nan::Set(js_node, Nan::New<v8::String>("name").ToLocalChecked(), name);
  Nan::Set(js_node, Nan::New<v8::String>("file").ToLocalChecked(), scriptName);
  Nan::Set(js_node, Nan::New<v8::String>("line").ToLocalChecked(), line);
  Nan::Set(js_node, Nan::New<v8::String>("column").ToLocalChecked(), column);

  // @TODO Deopt info needs to be added to backend
  // size_t size = deoptInfos.size();

  // if(size > 0) {
  //   Local<v8::Array> deoptReasons = Nan::New<v8::Array>(size);
    
  //   for(size_t i = 0; i < size; i++) {
  //     Nan::Set(deoptReasons, i, Nan::New<v8::String>(deoptInfos[i].deopt_reason).ToLocalChecked());
  //   }

  //   Nan::Set(js_node, Nan::New<v8::String>("deopt_reasons").ToLocalChecked(), deoptReasons);
  // };

  return js_node;
};


v8::Local<v8::Object> CreateSample(uint32_t stack_id, uint32_t sample_timestamp_us, uint32_t thread_id) {
  v8::Local<v8::Object> js_node = Nan::New<v8::Object>();

  Nan::Set(js_node, Nan::New<v8::String>("stack_id").ToLocalChecked(), Nan::New<v8::Number>(stack_id));
  Nan::Set(js_node, Nan::New<v8::String>("thread_id").ToLocalChecked(), Nan::New<v8::String>(std::to_string(thread_id)).ToLocalChecked());
  Nan::Set(js_node, Nan::New<v8::String>("elapsed_since_start_ns").ToLocalChecked(), Nan::New<v8::Number>(sample_timestamp_us * 1000));

  return js_node;
};

std::tuple <v8::Local<v8::Value>, v8::Local<v8::Value>, v8::Local<v8::Value>> GetSamples(const v8::CpuProfile* profile, uint32_t thread_id) {
    const uint32_t profile_start_time_us = profile->GetStartTime();
    const int sampleCount = profile->GetSamplesCount();

    uint32_t unique_frame_id = 0;
    std::unordered_map<uint32_t, uint32_t> frameLookupTable;

    v8::Local<v8::Array> stacks = Nan::New<v8::Array>(sampleCount);
    v8::Local<v8::Array> samples = Nan::New<v8::Array>(sampleCount);
    v8::Local<v8::Array> frames = Nan::New<v8::Array>();

    for(int i = 0; i < sampleCount; i++) {
        const v8::Local<v8::Value> sample = CreateSample(i, profile->GetSampleTimestamp(i) - profile_start_time_us, thread_id);
        const v8::CpuProfileNode* node = profile->GetSample(i);
        // A stack is a list of frames ordered from outermost (top) to innermost frame (bottom)
        v8::Local<v8::Array> stack = Nan::New<v8::Array>();
        uint32_t stack_depth = 0;

        while(node != nullptr && stack_depth < MAX_STACK_DEPTH) {
            const uint32_t nodeId = node->GetNodeId();
            auto frame_index = frameLookupTable.find(nodeId);
            auto deoptReason = node->GetDeoptInfos();

            // If the frame does not exist in the index
            if(frame_index == frameLookupTable.end()) {
                frameLookupTable.insert({nodeId, unique_frame_id});

                Nan::Set(stack, stack_depth, Nan::New<v8::Number>(unique_frame_id));
                Nan::Set(frames, unique_frame_id, CreateFrameNode(
                    node->GetFunctionName(),
                    node->GetScriptResourceName(),
                    Nan::New<v8::Integer>(node->GetLineNumber()),
                    Nan::New<v8::Integer>(node->GetColumnNumber()),
                    deoptReason
                ));
                unique_frame_id++;
            } else {
              // If it was already indexed, just add it's id to the stack
                Nan::Set(stack, stack_depth, Nan::New<v8::Number>(frame_index->second));
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

v8::Local<v8::Value> CreateProfile(const v8::CpuProfile* profile, uint32_t thread_id) {
  v8::Local<v8::Object> js_profile = Nan::New<v8::Object>();

  Nan::Set(js_profile, Nan::New<v8::String>("profile_relative_started_at_ns").ToLocalChecked(), Nan::New<v8::Number>(profile->GetStartTime() * 1000));
  Nan::Set(js_profile, Nan::New<v8::String>("profile_relative_ended_at_ns").ToLocalChecked(), Nan::New<v8::Number>(profile->GetEndTime() * 1000));

#if PROFILER_FORMAT == FORMAT_SAMPLED || FORMAT_BENCHMARK == 1
  std::tuple<v8::Local<v8::Value>, v8::Local<v8::Value>, v8::Local<v8::Value>> samples = GetSamples(profile, thread_id);
  Nan::Set(js_profile, Nan::New<v8::String>("stacks").ToLocalChecked(), std::get<0>(samples));
  Nan::Set(js_profile, Nan::New<v8::String>("samples").ToLocalChecked(), std::get<1>(samples));
  Nan::Set(js_profile, Nan::New<v8::String>("frames").ToLocalChecked(), std::get<2>(samples));
#endif
#if PROFILER_FORMAT == FORMAT_RAW || FORMAT_BENCHMARK == 1
  Nan::Set(js_profile, Nan::New<v8::String>("top_down_root").ToLocalChecked(), CreateFrameGraph(profile->GetTopDownRoot()));
#endif
  return js_profile;
};


//***************************************************************************
// Exported profiler methods
//***************************************************************************

// StartProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aedf6a5ca49432ab665bc3a1ccf46cca4
static void StartProfiling(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if(args[0].IsEmpty() || !args[0]->IsString()) {
    return Nan::ThrowError("StartProfiling expects a string as first argument.");
  };

  v8::Local<v8::String> title = Nan::To<v8::String>(args[0]).ToLocalChecked();

  v8::CpuProfilingOptions options = v8::CpuProfilingOptions{ 
    v8::CpuProfilingMode::kLeafNodeLineNumbers, v8::CpuProfilingOptions::kNoSampleLimit, 
    SAMPLING_INTERVAL_US };

  Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<v8::External>()->Value());
  profiler->cpu_profiler->StartProfiling(title, options);
};

// StopProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#a40ca4c8a8aa4c9233aa2a2706457cc80
static void StopProfiling(const v8::FunctionCallbackInfo<v8::Value>& args) {
    if(args[0].IsEmpty() || !args[0]->IsString()) {
        return Nan::ThrowError("StopProfiling expects a string as first argument.");
    };

    if(args[1].IsEmpty()) {
        return Nan::ThrowError("StopProfiling expects a number as second argument.");
    };

    if(!args[1]->IsNumber()){
        return Nan::ThrowError("StopProfiling expects a thread_id of type number as second argument.");
    };


    Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<v8::External>()->Value());
    v8::CpuProfile* profile = profiler->cpu_profiler->StopProfiling(Nan::To<v8::String>(args[0]).ToLocalChecked());

    // If for some reason stopProfiling was called with an invalid profile title or
    // if that title had somehow been stopped already, profile will be null.
    if(profile == nullptr) {
      args.GetReturnValue().Set(Nan::Null());
      return;
    };

    args.GetReturnValue().Set(CreateProfile(profile, Nan::To<uint32_t>(args[1]).FromJust()));
    profile->Delete();
};

// SetSamplingMode(string mode)
static void SetSamplingMode(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if(args[0].IsEmpty() || !args[0]->IsString()) {
      return Nan::ThrowError("SetSamplingMode expects a string as first argument.");
  };

  Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<v8::External>()->Value());

  // if(profiler->cpu_profiler::) {
  //   return Nan::ThrowError("Call SetSamplingMode() after stopping all profiles.");
  // };
}

//***************************************************************************
// Module init
//***************************************************************************
NODE_MODULE_INIT(/* exports, module, context */){
  v8::Isolate* isolate = context->GetIsolate();
  Profiler* profiler = new Profiler(isolate);
  v8::Local<v8::External> external = v8::External::New(isolate, profiler);

  exports->Set(context, 
               Nan::New<v8::String>("startProfiling").ToLocalChecked(),
               v8::FunctionTemplate::New(isolate, StartProfiling, external)->GetFunction(context).ToLocalChecked()).FromJust();
  exports->Set(context, 
               Nan::New<v8::String>("stopProfiling").ToLocalChecked(),
               v8::FunctionTemplate::New(isolate, StopProfiling, external)->GetFunction(context).ToLocalChecked()).FromJust();
}