{
  "targets": [
    {
      "target_name": "cpu_profiler",
      "sources": [ "src/bindings/cpu_profiler.cc" ],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ]
    }
  ]
}