{
  "targets": [
    {
      "target_name": "cpu_profiler",
      "sources": [ "src/bindings/cpu_profiler.cc" ],
      "defines": ["PROFILER_FORMAT=FORMAT_SAMPLED;"],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ]
    },
    {
      "target_name": "cpu_profiler_format_benchmark",
      "sources": [ "src/bindings/cpu_profiler.cc" ],
      "defines": ["FORMAT_BENCHMARK=0xF"],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ]
    }
  ]
}