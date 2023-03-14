{
  "targets": [
    {
      "target_name": "sentry_cpu_profiler",
      "sources": [ "bindings/cpu_profiler.cc" ],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ],
      # Silence gcc8 deprecation warning https://github.com/nodejs/nan/issues/807#issuecomment-455750192
      "cflags": ["-Wno-cast-function-type"]
    },
  ]
}