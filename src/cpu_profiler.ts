import { arch as _arch, platform as _platform } from 'os';
import { env, versions } from 'process';
import { threadId } from 'worker_threads';
import { getAbi } from 'node-abi';
import { join, resolve } from 'path';
import { familySync } from 'detect-libc';

import { GLOBAL_OBJ, logger } from '@sentry/utils';
import { isDebugBuild } from './env';
import type { PrivateV8CpuProfilerBindings, V8CpuProfilerBindings } from './types';

const stdlib = familySync();
const platform = process.env['BUILD_PLATFORM'] || _platform();
const arch = process.env['BUILD_ARCH'] || _arch();
const abi = getAbi(versions.node, 'node');
const identifier = [platform, arch, stdlib, abi].filter((c) => c !== undefined && c !== null).join('-');

const built_from_source_path = resolve(__dirname, `./sentry_cpu_profiler-${identifier}`);

export function importCppBindingsModule(): PrivateV8CpuProfilerBindings {
  // If a binary path is specified, use that.
  if (env['SENTRY_PROFILER_BINARY_PATH']) {
    const envPath = env['SENTRY_PROFILER_BINARY_PATH'];
    return require(envPath);
  }

  // If a user specifies a different binary dir, they are in control of the binaries being moved there
  if (env['SENTRY_PROFILER_BINARY_DIR']) {
    const binaryPath = join(resolve(env['SENTRY_PROFILER_BINARY_DIR']), `sentry_cpu_profiler-${identifier}`);
    return require(binaryPath + '.node');
  }

  /* eslint-disable no-fallthrough */
  // We need the fallthrough so that in the end, we can fallback to the require dynamice require.
  // This is for cases where precompiled binaries were not provided, but may have been compiled from source.
  switch (platform) {
    case 'darwin': {
      switch (arch) {
        case 'x64': {
          switch (abi) {
            case '93': {
              return require('./sentry_cpu_profiler-darwin-x64-93.node');
            }
            case '108': {
              return require('./sentry_cpu_profiler-darwin-x64-108.node');
            }
          }
        }
        case 'arm64': {
          switch (abi) {
            case '83': {
              return require('./sentry_cpu_profiler-darwin-arm64-83.node');
            }
            case '93': {
              return require('./sentry_cpu_profiler-darwin-arm64-93.node');
            }
            case '108': {
              return require('./sentry_cpu_profiler-darwin-arm64-108.node');
            }
          }
        }
      }
    }

    case 'win32': {
      switch (arch) {
        case 'x64': {
          switch (abi) {
            case '93': {
              return require('./sentry_cpu_profiler-win32-x64-93.node');
            }
            case '108': {
              return require('./sentry_cpu_profiler-win32-x64-108.node');
            }
          }
        }
      }
    }

    case 'linux': {
      switch (arch) {
        case 'x64': {
          switch (stdlib) {
            case 'musl': {
              switch (abi) {
                case '83': {
                  return require('./sentry_cpu_profiler-linux-x64-musl-83.node');
                }
                case '93': {
                  return require('./sentry_cpu_profiler-linux-x64-musl-93.node');
                }
                case '108': {
                  return require('./sentry_cpu_profiler-linux-x64-musl-108.node');
                }
              }
              break;
            }
            case 'glibc': {
              switch (abi) {
                case '83': {
                  return require('./sentry_cpu_profiler-linux-x64-glibc-83.node');
                }
                case '93': {
                  return require('./sentry_cpu_profiler-linux-x64-glibc-93.node');
                }
                case '108': {
                  return require('./sentry_cpu_profiler-linux-x64-glibc-108.node');
                }
              }
            }
          }
        }
        case 'arm64': {
          switch (stdlib) {
            case 'musl': {
              switch (abi) {
                case '83': {
                  return require('./sentry_cpu_profiler-linux-arm64-musl-83.node');
                }
                case '93': {
                  return require('./sentry_cpu_profiler-linux-arm64-musl-93.node');
                }
                case '108': {
                  return require('./sentry_cpu_profiler-linux-arm64-musl-108.node');
                }
              }
            }
            case 'glibc': {
              switch (abi) {
                case '83': {
                  return require('./sentry_cpu_profiler-linux-arm64-glibc-83.node');
                }
                case '93': {
                  return require('./sentry_cpu_profiler-linux-arm64-glibc-93.node');
                }
                case '108': {
                  return require('./sentry_cpu_profiler-linux-arm64-glibc-108.node');
                }
              }
            }
          }
        }
      }
    }

    default: {
      return require(built_from_source_path + '.node');
    }
  }
  /* eslint-enable no-fallthrough */
}

const PrivateCpuProfilerBindings: PrivateV8CpuProfilerBindings = importCppBindingsModule();
const CpuProfilerBindings: V8CpuProfilerBindings = {
  startProfiling(name: string) {
    if (!PrivateCpuProfilerBindings) {
      if (isDebugBuild()) {
        logger.log('[Profiling] Bindings not loaded, ignoring call to startProfiling.');
      }
      return;
    }

    return PrivateCpuProfilerBindings.startProfiling(name);
  },
  stopProfiling(name: string) {
    if (!PrivateCpuProfilerBindings) {
      if (isDebugBuild()) {
        logger.log('[Profiling] Bindings not loaded or profile was never started, ignoring call to stopProfiling.');
      }
      return null;
    }
    return PrivateCpuProfilerBindings.stopProfiling(name, threadId, !!GLOBAL_OBJ._sentryDebugIds);
  }
};

export { PrivateCpuProfilerBindings };
export { CpuProfilerBindings };
