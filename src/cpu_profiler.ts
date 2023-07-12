import { arch as _arch, platform as _platform } from 'os';
import { env, versions } from 'process';
import { threadId } from 'worker_threads';
import { getAbi } from 'node-abi';
import { join, resolve } from 'path';
import { familySync } from 'detect-libc';

import { GLOBAL_OBJ, logger } from '@sentry/utils';
import { isDebugBuild } from './env';

const stdlib = familySync();
const platform = _platform();
const arch = process.env['BUILD_ARCH'] || _arch();
const abi = getAbi(versions.node, 'node');
const identifier = [platform, arch, stdlib, abi].filter((c) => c !== undefined && c !== null).join('-');

const defaultPath = `./sentry_cpu_profiler-${identifier}.node`;

export async function importCppBindingsModule(): Promise<PrivateV8CpuProfilerBindings> {
  // If a binary path is specified, use that.
  if (env['SENTRY_PROFILER_BINARY_PATH']) {
    return (await import(env['SENTRY_PROFILER_BINARY_PATH'])) as PrivateV8CpuProfilerBindings;
  }

  // If a user specifies a different binary dir, they are in control of the binaries being moved there
  if (env['SENTRY_PROFILER_BINARY_DIR']) {
    const binaryPath = join(resolve(env['SENTRY_PROFILER_BINARY_DIR']), `sentry_cpu_profiler-${identifier}.node`);
    return await import(binaryPath);
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
              // @ts-expect-error - this is the correct path, we just dont have the binaries locally
              return await import('./sentry_cpu_profiler-darwin-x64-93.node');
            }
            case '108': {
              // @ts-expect-error - this is the correct path, we just dont have the binaries locally
              return await import('./sentry_cpu_profiler-darwin-x64-108.node');
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
              // @ts-expect-error - this is the correct path, we just dont have the binaries locally
              return await import('./sentry_cpu_profiler-win32-x64-93.node');
            }
            case '108': {
              // @ts-expect-error - this is the correct path, we just dont have the binaries locally
              return await import('./sentry_cpu_profiler-win32-x64-108.node');
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
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-x64-musl-83.node');
                }
                case '93': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-x64-musl-93.node');
                }
                case '108': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-x64-musl-108.node');
                }
              }
              break;
            }
            case 'glibc': {
              switch (abi) {
                case '83': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-x64-glibc-83.node');
                }
                case '93': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-x64-glibc-93.node');
                }
                case '108': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-x64-glibc-108.node');
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
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-arm64-musl-83.node');
                }
                case '93': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-arm64-musl-93.node');
                }
                case '108': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-arm64-musl-108.node');
                }
              }
            }
            case 'glibc': {
              switch (abi) {
                case '83': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-arm64-glibc-83.node');
                }
                case '93': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-arm64-glibc-93.node');
                }
                case '108': {
                  // @ts-expect-error - this is the correct path, we just dont have the binaries locally
                  return await import('./sentry_cpu_profiler-linux-arm64-glibc-108.node');
                }
              }
            }
          }
        }
      }
    }

    default: {
      return await import(defaultPath);
    }
  }
  /* eslint-enable no-fallthrough */
}

interface Sample {
  stack_id: number;
  thread_id: string;
  elapsed_since_start_ns: string;
}

type Stack = number[];

type Frame = {
  function: string;
  file: string;
  line: number;
  column: number;
};

export interface RawThreadCpuProfile {
  profile_id?: string;
  stacks: ReadonlyArray<Stack>;
  samples: ReadonlyArray<Sample>;
  frames: ReadonlyArray<Frame>;
  resources: ReadonlyArray<string>;
  profiler_logging_mode: 'eager' | 'lazy';
}
export interface ThreadCpuProfile {
  stacks: ReadonlyArray<Stack>;
  samples: ReadonlyArray<Sample>;
  frames: ReadonlyArray<Frame>;
  thread_metadata: Record<string, { name?: string; priority?: number }>;
  queue_metadata?: Record<string, { label: string }>;
}

interface PrivateV8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string, threadId: number, collectResources: boolean): RawThreadCpuProfile | null;
  getFrameModule(abs_path: string): string;
}

interface V8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string): RawThreadCpuProfile | null;
}

let PrivateCpuProfilerBindings: PrivateV8CpuProfilerBindings;
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

(async () => {
  PrivateCpuProfilerBindings = await importCppBindingsModule();
})();

export { PrivateCpuProfilerBindings };
export { CpuProfilerBindings };
