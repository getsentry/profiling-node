{
  "targets": [
    {
      "target_name": "cpu_profiler",
      "sources": [ "bindings/cpu_profiler.cc" ],
      "defines": ["PROFILER_FORMAT=FORMAT_SAMPLED"],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ]
    },
  ]
}