{
  "targets": [
    {
      "target_name": "sentry_cpu_profiler",
      "sources": [ "bindings/cpu_profiler.cc" ],
      "defines": ["PROFILER_FORMAT=FORMAT_SAMPLED"],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ],
      "xcode_settings": {
        "OTHER_CFLAGS": [ "-std=c++17"],
      },
      "conditions": [
        ['OS=="mac"', {
            "xcode_settings": {
              "OTHER_CPLUSPLUSFLAGS" : [ "-std=c++20", "-stdlib=libc++" ],
              "OTHER_LDFLAGS": [ "-stdlib=libc++" ],
            }
        }],
        ['OS=="win"', {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "AdditionalOptions": [ "-std:c++20", ],
            },
          },
        }]
      ]
    },
  ]
}