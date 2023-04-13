import { getAbi } from 'node-abi';
import { join } from 'path';
import { arch, platform } from 'os';
import { familySync } from 'detect-libc';

import { threadId } from 'worker_threads';
import { getProjectRootDirectory } from './utils';

// __START__REPLACE__DIRNAME__
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const _dirname = dirname(fileURLToPath(import.meta.url));
// __END__REPLACE__DIRNAME__

// __START___REPLACE__REQUIRE__
import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
// __END__REPLACE__REQUIRE__

export function importCppBindingsModule(): PrivateV8CpuProfilerBindings {
  if (process.env['SENTRY_PROFILER_BINARY_PATH']) {
    return _require(process.env['SENTRY_PROFILER_BINARY_PATH']);
  }

  const family = familySync();
  const userPlatform = platform();
  const binariesDirectory = join(_dirname, '..', 'binaries');
  const userArchitecture = process.env['BUILD_ARCH'] || arch();
  const identifier = [userPlatform, userArchitecture, family].filter((c) => c !== undefined && c !== null).join('-');

  return _require(
    join(binariesDirectory, `sentry_cpu_profiler-v${getAbi(process.versions.node, 'node')}-${identifier}.node`)
  );
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
