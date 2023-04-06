
#include <unordered_map>
#include <string>
#include <assert.h>
#include <node_api.h>
#include <v8-profiler.h>
#include <v8.h>

#define FORMAT_SAMPLED 2
#define FORMAT_RAW 1

#ifndef PROFILER_FORMAT 
#define PROFILER_FORMAT FORMAT_SAMPLED
#endif

#ifndef FORMAT_BENCHMARK
#define FORMAT_BENCHMARK 0
#endif

static const uint8_t kMaxStackDepth = 128;
static const float kSamplingFrequency = 99.0; // 99 to avoid lockstep sampling
static const float kSamplingHz = 1 / kSamplingFrequency;
static const int kSamplingInterval = kSamplingHz * 1e6;
static const v8::CpuProfilingNamingMode kNamingMode = v8::CpuProfilingNamingMode::kDebugNaming;
static const v8::CpuProfilingLoggingMode kLoggingMode = v8::CpuProfilingLoggingMode::kEagerLogging;

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

  return kLoggingMode;
}
class Profiler {
public:
  explicit Profiler(napi_env& env, v8::Isolate* isolate):
    cpu_profiler(
      v8::CpuProfiler::New(isolate, kNamingMode, getLoggingMode())) {
    napi_add_env_cleanup_hook(env, DeleteInstance, this);
  }

  v8::CpuProfiler* cpu_profiler;

  static void DeleteInstance(void* data) {
    Profiler* profiler = static_cast<Profiler*>(data);
    profiler->cpu_profiler->Dispose();
    delete profiler;
  }
};

napi_value CreateFrameNode(napi_env& env, const v8::CpuProfileNode& node, const std::string& app_root_dir) {
  napi_value js_node;
  napi_create_object(env, &js_node);

  napi_value function_name_prop;
  napi_create_string_utf8(env, node.GetFunctionNameStr(), NAPI_AUTO_LENGTH, &function_name_prop);
  napi_set_named_property(env, js_node, "function_name", function_name_prop);

  napi_value abs_path_prop;
  napi_create_string_utf8(env, node.GetScriptResourceNameStr(), NAPI_AUTO_LENGTH, &abs_path_prop);
  napi_set_named_property(env, js_node, "abs_path", abs_path_prop);

  if (!app_root_dir.empty()) {
    std::string abs_path_str = node.GetScriptResourceNameStr();

    if (abs_path_str.compare(0, app_root_dir.size(), app_root_dir) == 0) {
      std::string filename_str = abs_path_str.substr(app_root_dir.length());

      if (!filename_str.empty()) {
        napi_value filename_prop;
        napi_create_string_utf8(env, filename_str.c_str(), NAPI_AUTO_LENGTH, &filename_prop);
        napi_set_named_property(env, js_node, "filename", filename_prop);
      }
    }
  }

  napi_value line_number_prop;
  napi_create_int32(env, node.GetLineNumber(), &line_number_prop);
  napi_set_named_property(env, js_node, "line_number", line_number_prop);

  napi_value column_number_prop;
  napi_create_int32(env, node.GetColumnNumber(), &column_number_prop);
  napi_set_named_property(env, js_node, "column_number", column_number_prop);

  bool is_script = node.GetSourceType() == v8::CpuProfileNode::SourceType::kScript;
  napi_value is_script_prop;
  napi_get_boolean(env, is_script, &is_script_prop);
  napi_set_named_property(env, js_node, "is_script", is_script_prop);

  return js_node;
};



napi_value CreateSample(napi_env& env, const uint32_t stack_id, const int64_t sample_timestamp_us, const uint32_t thread_id) {
  napi_value js_node;
  napi_create_object(env, &js_node);

  napi_value stack_id_prop;
  napi_create_uint32(env, stack_id, &stack_id_prop);
  napi_set_named_property(env, js_node, "stack_id", stack_id_prop);

  napi_value thread_id_prop;
  napi_create_string_utf8(env, std::to_string(thread_id).c_str(), NAPI_AUTO_LENGTH, &thread_id_prop);
  napi_set_named_property(env, js_node, "thread_id", thread_id_prop);

  napi_value elapsed_since_start_ns_prop;
  napi_create_int64(env, sample_timestamp_us * 1000, &elapsed_since_start_ns_prop);
  napi_set_named_property(env, js_node, "elapsed_since_start_ns", elapsed_since_start_ns_prop);

  return js_node;
};

std::string kDelimiter = std::string(";");
std::string hashCpuProfilerNodeByPath(const v8::CpuProfileNode* node, std::string& path) {
  path.clear();
  
  while (node != nullptr) {
    path.append(std::to_string(node->GetNodeId()));
    node = node->GetParent();
  }

  return path;
}

static void GetSamples(napi_env& env, const v8::CpuProfile* profile, const uint32_t thread_id, const std::string& app_root_dir, napi_value& samples, napi_value& stacks, napi_value& frames) {
  napi_status status;

  const int64_t profile_start_time_us = profile->GetStartTime();
  const int sampleCount = profile->GetSamplesCount();

  uint32_t unique_stack_id = 0;
  uint32_t unique_frame_id = 0;

  // Initialize the lookup tables for stacks and frames, both of these are indexed
  // in the sample format we are using to optimize for size.
  std::unordered_map<uint32_t, uint32_t> frame_lookup_table;
  std::unordered_map<std::string, int> stack_lookup_table;

  std::string node_hash = "";

  for (int i = 0; i < sampleCount; i++) {
    uint32_t stack_index = unique_stack_id;

    const v8::CpuProfileNode* node = profile->GetSample(i);
    const int64_t sample_timestamp = profile->GetSampleTimestamp(i);

    // If a node was only on top of the stack once, then it will only ever 
    // be inserted once and there is no need for hashing.
    if (node->GetHitCount() > 1) {
      hashCpuProfilerNodeByPath(node, node_hash);

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

    napi_value sample = CreateSample(env, stack_index, sample_timestamp - profile_start_time_us, thread_id);

    if (stack_index != unique_stack_id) {
      napi_value index;
      status = napi_create_uint32(env, stack_index, &index);
      assert(status == napi_ok);

      status = napi_set_property(env, samples, index, sample);
      assert(status == napi_ok);
      continue;
    }

    // A stack is a list of frames ordered from outermost (top) to innermost frame (bottom)
    napi_value stack;
    status = napi_create_array(env, &stack);
    assert(status == napi_ok);

    uint32_t stack_depth = 0;

    while (node != nullptr && stack_depth < kMaxStackDepth) {
      auto nodeId = node->GetNodeId();
      auto frame_index = frame_lookup_table.find(nodeId);

      // If the frame does not exist in the index
      if (frame_index == frame_lookup_table.end()) {
        frame_lookup_table.insert({ nodeId, unique_frame_id });

        napi_value frame_id;
        status = napi_create_uint32(env, unique_frame_id, &frame_id);
        assert(status == napi_ok);

        napi_value depth;
        status = napi_create_uint32(env, stack_depth, &depth);
        assert(status == napi_ok);

        status = napi_set_property(env, stack, depth, frame_id);
        assert(status == napi_ok);

        status = napi_set_property(env, frames, frame_id, CreateFrameNode(env, *node, app_root_dir));
        assert(status == napi_ok);
        
        unique_frame_id++;
      }
      else {
        // If it was already indexed, just add it's id to the stack
        napi_value depth;
        status = napi_create_uint32(env, stack_depth, &depth);
        assert(status == napi_ok);

        napi_value frame;
        status = napi_create_uint32(env, frame_index->second, &frame);
        assert(status == napi_ok);

        napi_set_property(env, stack, depth, frame);
      };

      // Continue walking down the stack
      node = node->GetParent();
      stack_depth++;
    }

    napi_value napi_stack_index;
    status = napi_create_uint32(env, stack_index, &napi_stack_index);
    assert(status == napi_ok);

    napi_value napi_sample;
    status = napi_create_uint32(env, i, &napi_sample);
    assert(status == napi_ok);

    status = napi_set_property(env, stacks, napi_sample, sample);
    assert(status == napi_ok);

    status = napi_set_property(env, samples, napi_sample, sample);
    assert(status == napi_ok);

    unique_stack_id++;
  }
}

// StartProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aedf6a5ca49432ab665bc3a1ccf46cca4
static napi_value TranslateProfile(napi_env env, const v8::CpuProfile* profile, const uint32_t thread_id, const std::string& app_root_directory){
  napi_status status;
  napi_value js_profile;

  status = napi_create_object(env, &js_profile);
  assert(status == napi_ok);

  napi_value logging_mode;
  napi_value samples;
  napi_value stacks;
  napi_value frames;

  status = napi_create_string_utf8(env, getLoggingMode() == v8::CpuProfilingLoggingMode::kEagerLogging ? "eager" : "lazy", NAPI_AUTO_LENGTH, &logging_mode);
  assert(status == napi_ok);

  status = napi_create_array(env, &samples);
  assert(status == napi_ok);

  status = napi_create_array(env, &stacks);
  assert(status == napi_ok);

  status = napi_create_array(env, &frames);
  assert(status == napi_ok);

  status = napi_set_named_property(env, js_profile, "samples", samples);
  assert(status == napi_ok);

  status = napi_set_named_property(env, js_profile, "stacks", stacks);
  assert(status == napi_ok);
  
  status = napi_set_named_property(env, js_profile, "frames", frames);
  assert(status == napi_ok);

  status = napi_set_named_property(env, js_profile, "logging_mode", logging_mode);
  assert(status == napi_ok);

  GetSamples(env, profile, thread_id, app_root_directory, samples, stacks, frames);

  return js_profile;
}

static napi_value StartProfiling(napi_env env, napi_callback_info info) {
  napi_status status;

  napi_value args[1];
  size_t argc = 1;

  status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);
  assert(status == napi_ok);

  napi_valuetype callbacktype0;
  status = napi_typeof(env, args[0], &callbacktype0);
  assert(status == napi_ok);

  if(callbacktype0 != napi_string){
    napi_throw_error(env, "NAPI_ERROR", "StartProfiling expects a string as first argument.");
    return NULL;
  }

  char title;
  status = napi_get_value_string_utf8(env, args[0], &title, NAPI_AUTO_LENGTH, NULL);
  assert(status == napi_ok);

  v8::Isolate* isolate = v8::Isolate::GetCurrent();
  assert(isolate != 0);

  v8::Local<v8::String> profile_title = v8::String::NewFromUtf8(isolate, &title, v8::NewStringType::kNormal).ToLocalChecked();

  if(!profile_title->Length() ){
    napi_throw_error(env, "NAPI_ERROR", "StartProfiling expects a string with a length of 100 or less as first argument.");
    return NULL;
  }

  Profiler* profiler;
  status = napi_get_instance_data(env, (void**)&profiler);
  assert(status == napi_ok);

  profiler->cpu_profiler->StartProfiling(profile_title, {
    v8::CpuProfilingMode::kCallerLineNumbers, v8::CpuProfilingOptions::kNoSampleLimit,
    kSamplingInterval });

  return NULL;
}

// StopProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#a40ca4c8a8aa4c9233aa2a2706457cc80
static napi_value StopProfiling(napi_env env, napi_callback_info info) {
  napi_status status;

  size_t argc = 2;
  napi_value args[argc];

  status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);
  assert(status == napi_ok);

  if(argc < 2){
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling expects two arguments.");
    return NULL;
  }

  // Verify the first argument is a string
  napi_valuetype callbacktype0;
  status = napi_typeof(env, args[0], &callbacktype0);
  assert(status == napi_ok);

  if(callbacktype0 != napi_string){
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling expects a string as first argument.");
   return NULL;
  }

  // Verify the second argument is a number
  napi_valuetype callbacktype1;
  status = napi_typeof(env, args[1], &callbacktype1);
  assert(status == napi_ok);

  if(callbacktype1 != napi_number){
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling expects a thread_id integer as second argument.");
   return NULL;
  }

  // Get the value of the first argument and convert it to v8::String
  v8::Isolate* isolate = v8::Isolate::GetCurrent();
  assert(isolate != 0);

  char title;
  status = napi_get_value_string_utf8(env, args[0], &title, NAPI_AUTO_LENGTH, NULL);
  assert(status == napi_ok);

  v8::Local<v8::String> profile_title = v8::String::NewFromUtf8(isolate, &title, v8::NewStringType::kNormal).ToLocalChecked();

  if(!profile_title->Length() ){
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling expects a string with a length of 100 or less as first argument.");
   return NULL;
  }

  // Get the value of the second argument and convert it to uint64
  int64_t thread_id;
  status = napi_get_value_int64(env, args[1], &thread_id);
  assert(status == napi_ok);


  // Get profiler from instance data
  Profiler* profiler;
  status = napi_get_instance_data(env, (void**)&profiler);
  assert(status == napi_ok);


  v8::CpuProfile* profile = profiler->cpu_profiler->StopProfiling(profile_title);
  // If for some reason stopProfiling was called with an invalid profile title or
  // if that title had somehow been stopped already, profile will be null.
  if (!profile) {
    return NULL;
  };

  std::string app_root_directory_str;

  if(argc > 2){
    char app_root_directory;

    napi_valuetype callbacktype1;
    status = napi_typeof(env, args[2], &callbacktype1);
    assert(status == napi_ok);

    status = napi_get_value_string_utf8(env, args[0], &app_root_directory, NAPI_AUTO_LENGTH, NULL);
    assert(status == napi_ok);

    app_root_directory_str = std::string(&app_root_directory);
  }

  napi_value js_profile = TranslateProfile(env, profile, thread_id, app_root_directory_str);
  profile->Delete();

  return js_profile;
};

napi_value Init(napi_env env, napi_value exports) {
  napi_status status;

  v8::Isolate* isolate = v8::Isolate::GetCurrent();

  if (isolate == nullptr) {
    napi_throw_error(env, nullptr, "Failed to initialize Sentry profiler: isolate is null.");
    return nullptr;
  }

  Profiler* profiler = new Profiler(env, isolate);
  napi_value external;
  status = napi_create_external(env, profiler, nullptr, nullptr, &external);
  if (status != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to create external for profiler instance.");
    return nullptr;
  }

  napi_value start_profiling;
  status = napi_create_function(env, "startProfiling", NAPI_AUTO_LENGTH, StartProfiling, external, &start_profiling);
  if (status != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to create startProfiling function.");
    return nullptr;
  }

  status = napi_set_named_property(env, exports, "startProfiling", start_profiling);
  if (status != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to set startProfiling property on exports.");
    return nullptr;
  }

  napi_value stop_profiling;
  status = napi_create_function(env, "stopProfiling", NAPI_AUTO_LENGTH, StopProfiling, external, &stop_profiling);
  if (status != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to create stopProfiling function.");
    return nullptr;
  }

  status = napi_set_named_property(env, exports, "stopProfiling", stop_profiling);
  if (status != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to set stopProfiling property on exports.");
    return nullptr;
  }

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)