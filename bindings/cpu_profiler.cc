
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

static const uint8_t MAX_STACK_DEPTH = 128;
static const float SAMPLING_FREQUENCY = 99.0; // 99 to avoid lockstep sampling
static const float SAMPLING_HZ = 1 / SAMPLING_FREQUENCY;
static const int SAMPLING_INTERVAL_US = SAMPLING_HZ * 1e6;
static const v8::CpuProfilingNamingMode NAMING_MODE = v8::CpuProfilingNamingMode::kDebugNaming;
static const v8::CpuProfilingLoggingMode LOGGING_MODE = v8::CpuProfilingLoggingMode::kEagerLogging;

// Allow users to override the default logging mode via env variable. This is useful 
// because sometimes the flow of the profiled program can be to execute many sequential 
// transaction - in that case, it may be preferable to set eager logging to avoid paying the
// high cost of profiling for each individual transaction (one example for this are jest 
// tests when run with --runInBand option).
v8::CpuProfilingLoggingMode getLoggingMode() {
  char* logging_mode = getenv("SENTRY_PROFILER_LOGGING_MODE");
  if (logging_mode) {
    if (std::strcmp(logging_mode, "eager") == 0) {
      return v8::CpuProfilingLoggingMode::kEagerLogging;
    } if (std::strcmp(logging_mode, "lazy") == 0) {
      return v8::CpuProfilingLoggingMode::kLazyLogging;
    }
  }

  return LOGGING_MODE;
}
class Profiler {
public:
  explicit Profiler(v8::Isolate* isolate):
    cpu_profiler(
      v8::CpuProfiler::New(isolate, NAMING_MODE, getLoggingMode())) {
    node::AddEnvironmentCleanupHook(isolate, DeleteInstance, this);
  }

  v8::CpuProfiler* cpu_profiler;

  static void DeleteInstance(void* data) {
    Profiler* profiler = static_cast<Profiler*>(data);
    profiler->cpu_profiler->Dispose();
    delete profiler;
  }
};

v8::Local<v8::Object> CreateFrameNode(
  const v8::CpuProfileNode& node,
  const std::string& app_root_dir
) {

  v8::Local<v8::Object> js_node = Nan::New<v8::Object>();

  Nan::Set(js_node, Nan::New<v8::String>("function").ToLocalChecked(), node.GetFunctionName());
  Nan::Set(js_node, Nan::New<v8::String>("abs_path").ToLocalChecked(), node.GetScriptResourceName());

  if (!app_root_dir.empty()) {
    std::string abs_path_str = node.GetScriptResourceNameStr();

    if (abs_path_str.compare(0, app_root_dir.size(), app_root_dir) == 0) {
      Nan::Set(js_node, Nan::New<v8::String>("filename").ToLocalChecked(), Nan::New<v8::String>(abs_path_str.substr(app_root_dir.length())).ToLocalChecked());
    }
  }

  Nan::Set(js_node, Nan::New<v8::String>("lineno").ToLocalChecked(), Nan::New<v8::Number>(node.GetLineNumber()));

  Nan::Set(js_node, Nan::New<v8::String>("colno").ToLocalChecked(), Nan::New<v8::Number>(node.GetColumnNumber()));

  if (node.GetSourceType() != v8::CpuProfileNode::SourceType::kScript) {
    Nan::Set(js_node, Nan::New<v8::String>("in_app").ToLocalChecked(), Nan::New<v8::Boolean>(false));
  }

  // @TODO Deopt info needs to be added to backend
  // size_t size = deoptInfos.size();

  // if(size > 0) {
  //   v8::Local<v8::Array> deoptReasons = Nan::New<v8::Array>(size);

  //   for(size_t i = 0; i < size; i++) {
  //     Nan::Set(deoptReasons, i, Nan::New<v8::String>(deoptInfos[i].deopt_reason).ToLocalChecked());
  //   }

  //   Nan::Set(js_node, Nan::New<v8::String>("deopt_reasons").ToLocalChecked(), deoptReasons);
  // };

  return js_node;
};


v8::Local<v8::Object> CreateSample(const uint32_t stack_id, const int64_t sample_timestamp_us, const uint32_t thread_id) {
  v8::Local<v8::Object> js_node = Nan::New<v8::Object>();

  Nan::Set(js_node, Nan::New<v8::String>("stack_id").ToLocalChecked(), Nan::New<v8::Number>(stack_id));
  Nan::Set(js_node, Nan::New<v8::String>("thread_id").ToLocalChecked(), Nan::New<v8::String>(std::to_string(thread_id)).ToLocalChecked());
  Nan::Set(js_node, Nan::New<v8::String>("elapsed_since_start_ns").ToLocalChecked(), Nan::New<v8::Number>(sample_timestamp_us * 1000));

  return js_node;
};

std::string hashCpuProfilerNodeByPath(const v8::CpuProfileNode* node) {
  std::string path = std::string();
  std::string delimiter = std::string(";");

  while (node != nullptr) {
    path += std::to_string(node->GetNodeId());
    path += delimiter;
    node = node->GetParent();
  }

  return path;
}

std::tuple <v8::Local<v8::Value>, v8::Local<v8::Value>, v8::Local<v8::Value>> GetSamples(const v8::CpuProfile& profile, const uint32_t thread_id, const std::string& app_root_dir) {
  const int64_t profile_start_time_us = profile.GetStartTime();
  const int sampleCount = profile.GetSamplesCount();

  uint32_t unique_stack_id = 0;
  uint32_t unique_frame_id = 0;

  // Initialize the lookup tables for stacks and frames, both of these are indexed
  // in the sample format we are using to optimize for size.
  std::unordered_map<uint32_t, uint32_t> frame_lookup_table;
  std::unordered_map<std::string, int> stack_lookup_table;

  v8::Local<v8::Array> samples = Nan::New<v8::Array>(sampleCount);
  v8::Local<v8::Array> stacks = Nan::New<v8::Array>();
  v8::Local<v8::Array> frames = Nan::New<v8::Array>();

  for (int i = 0; i < sampleCount; i++) {
    uint32_t stack_index = unique_stack_id;

    const v8::CpuProfileNode* node = profile.GetSample(i);
    const int64_t sample_timestamp = profile.GetSampleTimestamp(i);

    // If a node was only on top of the stack once, then it will only ever 
    // be inserted once and there is no need for hashing.
    if (node->GetHitCount() > 1) {
      std::string node_hash = hashCpuProfilerNodeByPath(node);
      std::unordered_map<std::string, int>::iterator stack_index_cache_hit = stack_lookup_table.find(node_hash);

      // If we have a hit, update the stack index, otherwise
      // insert it into the hash table and continue.
      if (stack_index_cache_hit != stack_lookup_table.end()) {
        stack_index = stack_index_cache_hit->second;
      }
      else {
        stack_lookup_table.insert({ node_hash, stack_index });
      }
    }


    const v8::Local<v8::Value> sample = CreateSample(stack_index, sample_timestamp - profile_start_time_us, thread_id);

    // If stack index differs from the sample index that means the stack had been indexed.
    if (stack_index != unique_stack_id) {
      Nan::Set(samples, i, sample);
      continue;
    }

    // A stack is a list of frames ordered from outermost (top) to innermost frame (bottom)
    v8::Local<v8::Array> stack = Nan::New<v8::Array>();
    uint32_t stack_depth = 0;

    while (node != nullptr && stack_depth < MAX_STACK_DEPTH) {
      auto nodeId = node->GetNodeId();
      auto frame_index = frame_lookup_table.find(nodeId);

      // If the frame does not exist in the index
      if (frame_index == frame_lookup_table.end()) {
        frame_lookup_table.insert({ nodeId, unique_frame_id });

        Nan::Set(stack, stack_depth, Nan::New<v8::Number>(unique_frame_id));
        Nan::Set(frames, unique_frame_id, CreateFrameNode(*node, app_root_dir));
        unique_frame_id++;
      }
      else {
        // If it was already indexed, just add it's id to the stack
        Nan::Set(stack, stack_depth, Nan::New<v8::Number>(frame_index->second));
      };

      // Continue walking down the stack
      node = node->GetParent();
      stack_depth++;
    }

    Nan::Set(stacks, stack_index, stack);
    Nan::Set(samples, i, sample);
    unique_stack_id++;
  };

  return std::make_tuple(stacks, samples, frames);
};

v8::Local<v8::Value> CreateProfile(const v8::CpuProfile& profile, const uint32_t thread_id, const std::string& app_root_directory) {
  v8::Local<v8::Object> js_profile = Nan::New<v8::Object>();

  Nan::Set(js_profile, Nan::New<v8::String>("profiler_logging_mode").ToLocalChecked(), Nan::New<v8::String>(getLoggingMode() == v8::CpuProfilingLoggingMode::kEagerLogging ? "eager" : "lazy").ToLocalChecked());


  std::tuple<v8::Local<v8::Value>, v8::Local<v8::Value>, v8::Local<v8::Value>> samples = GetSamples(profile, thread_id, app_root_directory);
  Nan::Set(js_profile, Nan::New<v8::String>("stacks").ToLocalChecked(), std::get<0>(samples));
  Nan::Set(js_profile, Nan::New<v8::String>("samples").ToLocalChecked(), std::get<1>(samples));
  Nan::Set(js_profile, Nan::New<v8::String>("frames").ToLocalChecked(), std::get<2>(samples));

  return js_profile;
};

// StartProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aedf6a5ca49432ab665bc3a1ccf46cca4
static void StartProfiling(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if (args[0].IsEmpty()) {
    return Nan::ThrowError("StartProfiling expects a string as first argument.");
  };

  if (!args[0]->IsString()) {
    return Nan::ThrowError("StartProfiling requires a string as the first argument.");
  };

  v8::Local<v8::String> title = Nan::To<v8::String>(args[0]).ToLocalChecked();
  Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<v8::External>()->Value());
  profiler->cpu_profiler->StartProfiling(title, {
    v8::CpuProfilingMode::kCallerLineNumbers, v8::CpuProfilingOptions::kNoSampleLimit,
    SAMPLING_INTERVAL_US });
};

// StopProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#a40ca4c8a8aa4c9233aa2a2706457cc80
static void StopProfiling(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if (args[0].IsEmpty()) {
    return Nan::ThrowError("StopProfiling expects a string as first argument.");
  };

  if (!args[0]->IsString()) {
    return Nan::ThrowError("StopProfiling expects a string as first argument.");
  };

  if (args[1].IsEmpty()) {
    return Nan::ThrowError("StopProfiling expects a number as second argument.");
  };

  if (!args[1]->IsNumber()) {
    return Nan::ThrowError("StopProfiling expects a thread_id of type number as second argument.");
  };

  Profiler* profiler = reinterpret_cast<Profiler*>(args.Data().As<v8::External>()->Value());
  v8::CpuProfile* profile = profiler->cpu_profiler->StopProfiling(Nan::To<v8::String>(args[0]).ToLocalChecked());

  // If for some reason stopProfiling was called with an invalid profile title or
  // if that title had somehow been stopped already, profile will be null.
  if (profile == nullptr) {
    args.GetReturnValue().Set(Nan::Null());
    return;
  };


  std::string app_root_directory = args[2].IsEmpty() ? std::string() : std::string(*Nan::Utf8String(args[2]));
  uint32_t thread_id = Nan::To<uint32_t>(args[1]).FromJust();

  v8::Local<v8::Value> js_profile = CreateProfile(*profile, thread_id, app_root_directory);
  profile->Delete();

  args.GetReturnValue().Set(js_profile);
};

NODE_MODULE_INIT(/* exports, module, context */) {
  v8::Isolate* isolate = context->GetIsolate();

  if (isolate == nullptr) {
    return Nan::ThrowError("Failed to initialize Sentry profiler: isolate is null.");
  }

  Profiler* profiler = new Profiler(isolate);
  v8::Local<v8::External> external = v8::External::New(isolate, profiler);

  exports->Set(context,
    Nan::New<v8::String>("startProfiling").ToLocalChecked(),
    v8::FunctionTemplate::New(isolate, StartProfiling, external)->GetFunction(context).ToLocalChecked()).FromJust();
  exports->Set(context,
    Nan::New<v8::String>("stopProfiling").ToLocalChecked(),
    v8::FunctionTemplate::New(isolate, StopProfiling, external)->GetFunction(context).ToLocalChecked()).FromJust();
}