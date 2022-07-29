{
  "targets": [
    {
      "target_name": "cpu_profiler",
      "sources": [ "src/bindings/cpu_profiler.cc" ],
      "defines": ["PROFILER_FORMAT=FORMAT_SAMPLED"],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ]
    },
    {
      "target_name": "cpu_profiler.graph",
      "sources": [ "src/bindings/cpu_profiler.cc" ],
      "defines": ["PROFILER_FORMAT=FORMAT_RAW"],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ]
    }
  ]
}