{
  'variables': {
    	'PROFILER_LOGGING_MODE%': '<!(echo "$SENTRY_PROFILER_LOGGING_MODE")',
	},
  "targets": [
    {
      "target_name": "cpu_profiler",
      "sources": [ "bindings/cpu_profiler.cc" ],
      "defines": ["PROFILER_FORMAT=FORMAT_SAMPLED"],
      'conditions': [
          ['PROFILER_LOGGING_MODE == "eager"', {
              'defines': ['PROFILER_LOGGING_MODE=1']
          }]
      ],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ]
    },
  ]
}