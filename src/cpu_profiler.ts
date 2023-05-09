import { arch, platform } from 'os';
import { env, versions } from 'process';
import { threadId } from 'worker_threads';
import { getAbi } from 'node-abi';
import { familySync } from 'detect-libc';

import { getProjectRootDirectory } from './utils';

// Keep these in sync with the replacements in esmmod.js and cjsmod.js
// __START__REPLACE__REQUIRE__
import { createRequire as aliasedCreateRequire } from 'module';
const require = aliasedCreateRequire(import.meta.url);
// __END__REPLACE__REQUIRE__

// @ts-expect-error whataa
export function importCppBindingsModule(): PrivateV8CpuProfilerBindings {
  if (env['SENTRY_PROFILER_BINARY_PATH']) {
    return require(env['SENTRY_PROFILER_BINARY_PATH'] as string);
  }

  const stdlib = familySync();
  const userPlatform = platform();
  const userArchitecture = env['BUILD_ARCH'] || arch();
  const identifier = [userPlatform, userArchitecture, stdlib].filter((c) => c !== undefined && c !== null).join('-');
  const abi = getAbi(versions.node, 'node');

  switch (userPlatform) {
    case 'darwin': {
      switch (userArchitecture) {
        case 'x64': {
          switch (abi) {
            case '83': {
              return require('./sentry_cpu_profiler-darwin-x64-83.node');
            }
            case '93': {
              return require('./sentry_cpu_profiler-darwin-x64-93.node');
            }
            case '108': {
              return require('./sentry_cpu_profiler-darwin-x64-108.node');
            }
          }
          break;
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
          break;
        }
      }
      break;
    }

    // case 'linux': {
    //   switch (userArchitecture) {
    //     case 'x64': {
    //       switch (stdlib) {
    //         case 'musl': {
    //           break;
    //         }
    //         case 'glibc': {
    //           break;
    //         }
    //       }
    //     }
    //     case 'arm64': {
    //       break;
    //     }
    //   }
    //   break;
    // }

    // case 'win32': {
    //   switch (userArchitecture) {
    //     case 'x64': {
    //       break;
    //     }
    //     case 'ia32': {
    //       break;
    //     }
    //     case 'arm64': {
    //       break;
    //     }
    //   }
    //   break;
    // }

    default: {
      return require(`./sentry_cpu_profiler-v${getAbi(versions.node, 'node')}-${identifier}.node`);
    }
  }
}

// Resolve the project root dir so we can try and compute a filename relative to it.
// We forward this to C++ code so we dont end up post-processing frames in JS.
const projectRootDirectory = getProjectRootDirectory();

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
  stacks: Stack[];
  samples: Sample[];
  frames: Frame[];
  profiler_logging_mode: 'eager' | 'lazy';
}
export interface ThreadCpuProfile {
  samples: Sample[];
  stacks: Stack[];
  frames: Frame[];
  thread_metadata: Record<string, { name?: string; priority?: number }>;
  queue_metadata?: Record<string, { label: string }>;
}

interface PrivateV8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string, threadId: number, projectRootDir: string | null): RawThreadCpuProfile | null;
  getFrameModule(abs_path: string, root_dir: string): string;
}

interface V8CpuProfilerBindings {
  startProfiling(name: string): void;
  stopProfiling(name: string): RawThreadCpuProfile | null;
}

const privateBindings: PrivateV8CpuProfilerBindings = importCppBindingsModule();
const CpuProfilerBindings: V8CpuProfilerBindings = {
  startProfiling(name: string) {
    return privateBindings.startProfiling(name);
  },
  stopProfiling(name: string) {
    return privateBindings.stopProfiling(name, threadId, projectRootDirectory);
  }
};
export { CpuProfilerBindings };
