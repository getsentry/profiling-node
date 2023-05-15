
#include <assert.h>
#include <node_api.h>
#include <v8-profiler.h>
#include <v8.h>
#include <string>
#include <unordered_map>
#include <iostream>

#define FORMAT_SAMPLED 2
#define FORMAT_RAW 1

#ifndef PROFILER_FORMAT 
#define PROFILER_FORMAT FORMAT_SAMPLED
#endif

#ifndef FORMAT_BENCHMARK
#define FORMAT_BENCHMARK 0
#endif

static const uint8_t kMaxStackDepth(128);
static const float kSamplingFrequency(99.0); // 99 to avoid lockstep sampling
static const float kSamplingHz(1 / kSamplingFrequency);
static const int kSamplingInterval(kSamplingHz * 1e6);
static const v8::CpuProfilingNamingMode kNamingMode(v8::CpuProfilingNamingMode::kDebugNaming);
static const v8::CpuProfilingLoggingMode kDefaultLoggingMode(v8::CpuProfilingLoggingMode::kEagerLogging);

// Allow users to override the default logging mode via env variable. This is useful 
// because sometimes the flow of the profiled program can be to execute many sequential 
// transaction - in that case, it may be preferable to set eager logging to avoid paying the
// high cost of profiling for each individual transaction (one example for this are jest 
// tests when run with --runInBand option).
static const char* kEagerLoggingMode = "eager";
static const char* kLazyLoggingMode = "lazy";
v8::CpuProfilingLoggingMode GetLoggingMode() {
  static const char* logging_mode(getenv("SENTRY_PROFILER_LOGGING_MODE"));

  // most times this wont be set so just bail early
  if (!logging_mode) {
    return kDefaultLoggingMode;
  }

  std::string logging_mode_str(logging_mode);
  // other times it'll likely be set to lazy as eager is the default
  if (logging_mode_str == kLazyLoggingMode) {
    return v8::CpuProfilingLoggingMode::kLazyLogging;
  } else if (logging_mode_str == kEagerLoggingMode) {
    return v8::CpuProfilingLoggingMode::kEagerLogging;
  }

  return kDefaultLoggingMode;
}

#ifdef _WIN32
static const char kPlatformSeparator = '\\';
static const char kWinDiskPrefix = ':';
#else
static const char kPlatformSeparator = '/';
#endif

static const char kSentryPathDelimiter = '.';
static const char kSentryFileDelimiter = ':';
static const std::string kNodeModulesPath = std::string("node_modules") + kPlatformSeparator;

static void GetFrameModule(const std::string& abs_path, const std::string& root_dir, std::string& module) {
  if (abs_path.empty()) {
    return;
  }

  size_t abs_path_len = abs_path.length();
  size_t root_dir_len = root_dir.length();
  
  // Guard from possible SDK bug, should probably throw an error here.
  if(root_dir_len > abs_path_len) {
    return;
  }

  if (abs_path_len > root_dir_len && root_dir_len > 0 && abs_path.rfind(root_dir, 0) == 0) {
    // strip the base path + trailing /
    module = abs_path.substr(root_dir_len + 1);
  }
  else {
    module = abs_path;
  }

  // Drop .js extension
  size_t module_len = module.length();
  if (module.compare(module_len - 3, 3, ".js") == 0) {
    module = module.substr(0, module_len - 3);
  }

  // Drop anything before and including node_modules/
  size_t node_modules_pos = module.rfind(kNodeModulesPath);
  if (node_modules_pos != std::string::npos) {
    module = module.substr(node_modules_pos + 13);
  }

  // Replace all path separators with dots except the last one, that one is replaced with a colon
  int match_count = 0;
  for (int pos = module.length() - 1; pos >= 0; pos--) {
    // if there is a match and it's not the first character, replace it
    if (module[pos] == kPlatformSeparator) {
      module[pos] = match_count == 0 ? kSentryFileDelimiter : kSentryPathDelimiter;
      match_count++;
    }
  }

  #ifdef _WIN32
  // Strip out C: prefix. On Windows, the drive letter is not part of the module name
  if(module[1] == kWinDiskPrefix){
    // We will try and strip our the disk prefix.
    module = module.substr(2, std::string::npos);
  }
  #endif

  if(module[0] == '.'){
    module = module.substr(1, std::string::npos);
  }
}

static napi_value GetFrameModuleWrapped(napi_env env, napi_callback_info info) {
  size_t argc = 3;
  napi_value argv[3];
  napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);

  size_t len;
  assert(napi_get_value_string_utf8(env, argv[0], NULL, 0, &len) == napi_ok);

  char* abs_path = (char*)malloc(len + 1);
  assert(napi_get_value_string_utf8(env, argv[0], abs_path, len + 1, &len) == napi_ok);
  assert(napi_get_value_string_utf8(env, argv[1], NULL, 0, &len) == napi_ok);

  char* root_dir = (char*)malloc(len + 1);
  assert(napi_get_value_string_utf8(env, argv[1], root_dir, len + 1, &len) == napi_ok);

  std::string module;
  napi_value napi_module;

  GetFrameModule(abs_path, root_dir, module);

  assert(napi_create_string_utf8(env, module.c_str(), NAPI_AUTO_LENGTH, &napi_module) == napi_ok);
  return napi_module;
}

class Profiler {
public:
  explicit Profiler(const napi_env& env, v8::Isolate* isolate):
    cpu_profiler(
      v8::CpuProfiler::New(isolate, kNamingMode, GetLoggingMode())) {
    napi_add_env_cleanup_hook(env, DeleteInstance, this);
  }

  v8::CpuProfiler* cpu_profiler;

  static void DeleteInstance(void* data) {
    Profiler* profiler = static_cast<Profiler*>(data);
    profiler->cpu_profiler->Dispose();
    delete profiler;
  }
};

napi_value CreateFrameNode(const napi_env& env, const v8::CpuProfileNode& node, const std::string& app_root_dir, std::unordered_map<std::string, std::string>& module_cache) {
  napi_value js_node;
  napi_create_object(env, &js_node);

  napi_value lineno_prop;
  napi_create_int32(env, node.GetLineNumber(), &lineno_prop);
  napi_set_named_property(env, js_node, "lineno", lineno_prop);

  napi_value colno_prop;
  napi_create_int32(env, node.GetColumnNumber(), &colno_prop);
  napi_set_named_property(env, js_node, "colno", colno_prop);

  if (node.GetSourceType() != v8::CpuProfileNode::SourceType::kScript) {
    napi_value system_frame_prop;
    napi_get_boolean(env, false, &system_frame_prop);
    napi_set_named_property(env, js_node, "in_app", system_frame_prop);
  }

  napi_value function;
  napi_create_string_utf8(env, node.GetFunctionNameStr(), NAPI_AUTO_LENGTH, &function);
  napi_set_named_property(env, js_node, "function", function);

  const char* resource = node.GetScriptResourceNameStr();

  if (resource != nullptr) {
    // resource is absolute path, set it on the abs_path property
    napi_value abs_path_prop;
    napi_create_string_utf8(env, resource, NAPI_AUTO_LENGTH, &abs_path_prop);
    napi_set_named_property(env, js_node, "abs_path", abs_path_prop);

    std::string module;
    std::string resource_str = std::string(resource);

    if (module_cache.find(resource_str) != module_cache.end()) {
      module = module_cache[resource_str];
    }
    else {
      GetFrameModule(resource_str, app_root_dir, module);
      module_cache.emplace(resource_str, module);
    }

    if (!module.empty()) {
      napi_value filename_prop;
      napi_create_string_utf8(env, module.c_str(), NAPI_AUTO_LENGTH, &filename_prop);
      napi_set_named_property(env, js_node, "module", filename_prop);
    }
  }

  return js_node;
};



napi_value CreateSample(const napi_env& env, const uint32_t stack_id, const int64_t sample_timestamp_us, const uint32_t thread_id) {
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

static void GetSamples(const napi_env& env, const v8::CpuProfile* profile, const uint32_t thread_id, const std::string& app_root_dir, napi_value& samples, napi_value& stacks, napi_value& frames) {
  const int64_t profile_start_time_us = profile->GetStartTime();
  const int sampleCount = profile->GetSamplesCount();

  uint32_t unique_stack_id = 0;
  uint32_t unique_frame_id = 0;

  // Initialize the lookup tables for stacks and frames, both of these are indexed
  // in the sample format we are using to optimize for size.
  std::unordered_map<uint32_t, uint32_t> frame_lookup_table;
  std::unordered_map<std::string, uint32_t> stack_lookup_table;
  std::unordered_map<std::string, std::string> module_cache;

  // At worst, we reserve the same amount of space as the number of samples
  stack_lookup_table.reserve(sampleCount);

  std::string node_hash = "";

  for (int i = 0; i < sampleCount; i++) {
    uint32_t stack_index = unique_stack_id;

    const v8::CpuProfileNode* node = profile->GetSample(i);
    const int64_t sample_timestamp = profile->GetSampleTimestamp(i);

    // If a node was only on top of the stack once, then it will only ever 
    // be inserted once and there is no need for hashing.
    if (node->GetHitCount() > 1) {
      hashCpuProfilerNodeByPath(node, node_hash);

      std::unordered_map<std::string, uint32_t>::iterator stack_index_cache_hit = stack_lookup_table.find(node_hash);

      // If we have a hit, update the stack index, otherwise
      // insert it into the hash table and continue.
      if (stack_index_cache_hit == stack_lookup_table.end()) {
        stack_lookup_table.emplace(node_hash, stack_index);
      }
      else {
        stack_index = stack_index_cache_hit->second;
      }
    }

    napi_value sample = CreateSample(env, stack_index, sample_timestamp - profile_start_time_us, thread_id);

    if (stack_index != unique_stack_id) {
      napi_value index;
      napi_create_uint32(env, i, &index);
      napi_set_property(env, samples, index, sample);
      continue;
    }

    // A stack is a list of frames ordered from outermost (top) to innermost frame (bottom)
    napi_value stack;
    napi_create_array(env, &stack);

    uint32_t stack_depth = 0;

    while (node != nullptr && stack_depth < kMaxStackDepth) {
      auto nodeId = node->GetNodeId();
      auto frame_index = frame_lookup_table.find(nodeId);

      // If the frame does not exist in the index
      if (frame_index == frame_lookup_table.end()) {
        frame_lookup_table.emplace(nodeId, unique_frame_id);

        napi_value frame_id;
        napi_create_uint32(env, unique_frame_id, &frame_id);

        napi_value depth;
        napi_create_uint32(env, stack_depth, &depth);
        napi_set_property(env, stack, depth, frame_id);
        napi_set_property(env, frames, frame_id, CreateFrameNode(env, *node, app_root_dir, module_cache));

        unique_frame_id++;
      }
      else {
        // If it was already indexed, just add it's id to the stack
        napi_value depth;
        napi_create_uint32(env, stack_depth, &depth);

        napi_value frame;
        napi_create_uint32(env, frame_index->second, &frame);
        napi_set_property(env, stack, depth, frame);
      };

      // Continue walking down the stack
      node = node->GetParent();
      stack_depth++;
    }

    napi_value napi_sample_index;
    napi_value napi_stack_index;

    napi_create_uint32(env, i, &napi_sample_index);
    napi_set_property(env, samples, napi_sample_index, sample);
    napi_create_uint32(env, stack_index, &napi_stack_index);
    napi_set_property(env, stacks, napi_stack_index, stack);

    unique_stack_id++;
  }
}

// StartProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#aedf6a5ca49432ab665bc3a1ccf46cca4
static napi_value TranslateProfile(const napi_env& env, const v8::CpuProfile* profile, const uint32_t thread_id, const std::string& app_root_directory) {
  napi_value js_profile;

  assert(napi_create_object(env, &js_profile) == napi_ok);

  napi_value logging_mode;
  napi_value samples;
  napi_value stacks;
  napi_value frames;

  assert(napi_create_string_utf8(env, GetLoggingMode() == v8::CpuProfilingLoggingMode::kEagerLogging ? "eager" : "lazy", NAPI_AUTO_LENGTH, &logging_mode) == napi_ok);

  assert(napi_create_array(env, &samples) == napi_ok);
  assert(napi_create_array(env, &stacks) == napi_ok);
  assert(napi_create_array(env, &frames) == napi_ok);
  assert(napi_set_named_property(env, js_profile, "samples", samples) == napi_ok);
  assert(napi_set_named_property(env, js_profile, "stacks", stacks) == napi_ok);
  assert(napi_set_named_property(env, js_profile, "frames", frames) == napi_ok);
  assert(napi_set_named_property(env, js_profile, "profiler_logging_mode", logging_mode) == napi_ok);

  GetSamples(env, profile, thread_id, app_root_directory, samples, stacks, frames);

  return js_profile;
}

static napi_value StartProfiling(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value argv[1];

  assert(napi_get_cb_info(env, info, &argc, argv, NULL, NULL) == napi_ok);

  napi_valuetype callbacktype0;
  assert(napi_typeof(env, argv[0], &callbacktype0) == napi_ok);

  if (callbacktype0 != napi_string) {
    napi_throw_error(env, "NAPI_ERROR", "TypeError: StartProfiling expects a string as first argument.");
    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  }

  size_t len;
  assert(napi_get_value_string_utf8(env, argv[0], NULL, 0, &len) == napi_ok);

  char* title = (char*)malloc(len + 1);
  assert(napi_get_value_string_utf8(env, argv[0], title, len + 1, &len) == napi_ok);

  if (len < 1) {
    napi_throw_error(env, "NAPI_ERROR", "StartProfiling expects a non-empty string as first argument, got an empty string.");

    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  }

  v8::Isolate* isolate = v8::Isolate::GetCurrent();
  assert(isolate != 0);

  v8::Local<v8::String> profile_title = v8::String::NewFromUtf8(isolate, title, v8::NewStringType::kNormal, len).ToLocalChecked();

  Profiler* profiler;
  assert(napi_get_instance_data(env, (void**)&profiler) == napi_ok);

  if (!profiler) {
    napi_throw_error(env, "NAPI_ERROR", "StartProfiling: Profiler is not initialized.");

    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  }

  v8::CpuProfilingOptions options(
    v8::CpuProfilingMode::kCallerLineNumbers,
    v8::CpuProfilingOptions::kNoSampleLimit,
    kSamplingInterval
  );

  profiler->cpu_profiler->StartProfiling(profile_title, options);

  
  napi_value napi_null;
  assert(napi_get_null(env, &napi_null) == napi_ok);

  return napi_null;
}

// StopProfiling(string title)
// https://v8docs.nodesource.com/node-18.2/d2/d34/classv8_1_1_cpu_profiler.html#a40ca4c8a8aa4c9233aa2a2706457cc80
static napi_value StopProfiling(napi_env env, napi_callback_info info) {
  size_t argc = 3;
  napi_value argv[3];

  assert(napi_get_cb_info(env, info, &argc, argv, NULL, NULL) == napi_ok);

  if (argc < 2) {
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling expects two arguments.");

    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  }

  // Verify the first argument is a string
  napi_valuetype callbacktype0;
  assert(napi_typeof(env, argv[0], &callbacktype0) == napi_ok);

  if (callbacktype0 != napi_string) {
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling expects a string as first argument.");

    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  }

  // Verify the second argument is a number
  napi_valuetype callbacktype1;
  assert(napi_typeof(env, argv[1], &callbacktype1) == napi_ok);

  if (callbacktype1 != napi_number) {
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling expects a thread_id integer as second argument.");

    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  }

  // Get the value of the first argument and convert it to v8::String
  v8::Isolate* isolate = v8::Isolate::GetCurrent();
  assert(isolate != 0);

  size_t len;
  assert(napi_get_value_string_utf8(env, argv[0], NULL, 0, &len) == napi_ok);

  char* title = (char*)malloc(len + 1);
  assert(napi_get_value_string_utf8(env, argv[0], title, len + 1, &len) == napi_ok);

  v8::Local<v8::String> profile_title = v8::String::NewFromUtf8(isolate, title, v8::NewStringType::kNormal, len).ToLocalChecked();

  if (len < 1) {
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling expects a string as first argument.");

    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  }

  // Get the value of the second argument and convert it to uint64
  int64_t thread_id;
  assert(napi_get_value_int64(env, argv[1], &thread_id) == napi_ok);


  // Get profiler from instance data
  Profiler* profiler;
  assert(napi_get_instance_data(env, (void**)&profiler) == napi_ok);

  if (!profiler) {
    napi_throw_error(env, "NAPI_ERROR", "StopProfiling: Profiler is not initialized.");

    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  }

  v8::CpuProfile* profile = profiler->cpu_profiler->StopProfiling(profile_title);
  // If for some reason stopProfiling was called with an invalid profile title or
  // if that title had somehow been stopped already, profile will be null.
  if (!profile) {
    napi_value napi_null;
    assert(napi_get_null(env, &napi_null) == napi_ok);

    return napi_null;
  };

  std::string app_root_directory_str = std::string("");

  napi_valuetype callbacktype2;
  assert(napi_typeof(env, argv[2], &callbacktype2) == napi_ok);

  if (callbacktype2 == napi_string) {
    size_t len;
    assert(napi_get_value_string_utf8(env, argv[2], NULL, 0, &len) == napi_ok);

    char* app_root_directory = (char*)malloc(len + 1);
    assert(napi_get_value_string_utf8(env, argv[2], app_root_directory, len + 1, &len) == napi_ok);

    app_root_directory_str = std::string(app_root_directory);
  }

  napi_value js_profile = TranslateProfile(env, profile, thread_id, app_root_directory_str);
  profile->Delete();

  return js_profile;
};

napi_value Init(napi_env env, napi_value exports) {
  v8::Isolate* isolate = v8::Isolate::GetCurrent();

  if (isolate == nullptr) {
    napi_throw_error(env, nullptr, "Failed to initialize Sentry profiler: isolate is null.");
    return NULL;
  }

  Profiler* profiler = new Profiler(env, isolate);

  if (napi_set_instance_data(env, profiler, NULL, NULL) != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to set instance data for profiler.");
    return NULL;
  }

  napi_value external;
  if (napi_create_external(env, profiler, nullptr, nullptr, &external) != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to create external for profiler instance.");
    return NULL;
  }

  napi_value start_profiling;
  if (napi_create_function(env, "startProfiling", NAPI_AUTO_LENGTH, StartProfiling, external, &start_profiling) != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to create startProfiling function.");
    return NULL;
  }

  if (napi_set_named_property(env, exports, "startProfiling", start_profiling) != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to set startProfiling property on exports.");
    return NULL;
  }

  napi_value stop_profiling;
  if (napi_create_function(env, "stopProfiling", NAPI_AUTO_LENGTH, StopProfiling, external, &stop_profiling) != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to create stopProfiling function.");
    return NULL;
  }

  if (napi_set_named_property(env, exports, "stopProfiling", stop_profiling) != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to set stopProfiling property on exports.");
    return NULL;
  }

  napi_value get_frame_module;
  if (napi_create_function(env, "getFrameModule", NAPI_AUTO_LENGTH, GetFrameModuleWrapped, external, &get_frame_module) != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to create getFrameModule function.");
    return NULL;
  }

  if (napi_set_named_property(env, exports, "getFrameModule", get_frame_module) != napi_ok) {
    napi_throw_error(env, nullptr, "Failed to set getFrameModule property on exports.");
    return NULL;
  }

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)