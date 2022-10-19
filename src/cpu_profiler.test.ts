import { CpuProfilerBindings } from './cpu_profiler';
import type { ThreadCpuProfile } from './cpu_profiler';

function fail(message: string): never {
  throw new Error(message);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const profiled = (name: string, fn: () => void) => {
  CpuProfilerBindings.startProfiling(name);
  fn();
  return CpuProfilerBindings.stopProfiling(name);
};

const assertValidSamplesAndStacks = (stacks: ThreadCpuProfile['stacks'], samples: ThreadCpuProfile['samples']) => {
  expect(stacks.length).toBe(samples.length);
};

describe('Profiler bindings', () => {
  it('exports profiler binding methods', () => {
    expect(typeof CpuProfilerBindings['startProfiling']).toBe('function');
    expect(typeof CpuProfilerBindings['stopProfiling']).toBe('function');
  });

  it('profiles a program', async () => {
    const profile = profiled('profiled-program', async () => {
      await wait(100);
    });

    if (!profile) fail('Profile is null');

    assertValidSamplesAndStacks(profile.stacks, profile.samples);
  });

  it('adds thread_id info', () => {
    const profile = profiled('profiled-program', async () => {
      await wait(100);
    });

    if (!profile) fail('Profile is null');
    const samples = profile.samples;

    if (!samples.length) {
      throw new Error('No samples');
    }
    for (const sample of samples) {
      expect(sample.thread_id).toBe('0');
    }
  });

  it('caps stack depth at 128', () => {
    const recurseToDepth = async (depth: number): Promise<number> => {
      if (depth === 0) {
        // Wait a bit to make sure stack gets sampled here
        await wait(500);
        return 0;
      }
      return await recurseToDepth(depth - 1);
    };

    const profile = profiled('profiled-program', async () => {
      await recurseToDepth(256);
    });

    if (!profile) fail('Profile is null');
    for (const stack of profile.stacks) {
      expect(stack.length).toBeLessThanOrEqual(128);
    }
  });

  it('does not record two profiles when titles match', () => {
    CpuProfilerBindings.startProfiling('same-title');
    CpuProfilerBindings.startProfiling('same-title');

    const first = CpuProfilerBindings.stopProfiling('same-title');
    const second = CpuProfilerBindings.stopProfiling('same-title');

    expect(first).not.toBe(null);
    expect(second).toBe(null);
  });

  it('does not throw if stopTransaction is called before startTransaction', () => {
    expect(CpuProfilerBindings.stopProfiling('does not exist')).toBe(null);
    expect(() => CpuProfilerBindings.stopProfiling('does not exist')).not.toThrow();
  });

  it('compiles with lazy logging by default', () => {
    const profile = profiled('profiled-program', async () => {
      await wait(100);
    });

    if (!profile) fail('Profile is null');
    expect(profile.profiler_logging_mode).toBe('lazy');
  });

  it('samples at ~99hz', async () => {
    CpuProfilerBindings.startProfiling('profile');
    await wait(100);
    const profile = CpuProfilerBindings.stopProfiling('profile');

    if (!profile) fail('Profile is null');

    // Exception for macos - we seem to get way less samples there, but I'm not sure if that's due to poor
    // performance of the actions runner, machine or something else. This needs more investigation to determine
    // the cause of low sample count. https://github.com/actions/runner-images/issues/1336 seems relevant.
    if (process.platform === 'darwin') {
      if (profile.samples.length < 2) {
        fail('Only ' + profile.samples.length + ' samples obtained on ' + process.platform + ', expected at least 2');
      }
    } else {
      if (profile.samples.length < 8) {
        fail('Only ' + profile.samples.length + ' samples obtained on ' + process.platform + ', expected at least 8');
      }
    }
    if (profile.samples.length > 13) {
      fail('Too many samples on ' + process.platform + ', got ' + profile.samples.length);
    }
  });

  it.skip('includes deopt reason', async () => {
    // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#52-the-object-being-iterated-is-not-a-simple-enumerable
    function iterateOverLargeHashTable() {
      const table: Record<string, number> = {};
      for (let i = 0; i < 1e5; i++) {
        table[i] = i;
      }
      // eslint-disable-next-line
      for (const _ in table) {
      }
    }

    const profile = profiled('profiled-program', async () => {
      iterateOverLargeHashTable();
    });

    // @ts-expect-error deopt reasons are disabled for now as we need to figure out the backend support
    const hasDeoptimizedFrame = profile.frames.some((f) => f.deopt_reasons && f.deopt_reasons.length > 0);
    expect(hasDeoptimizedFrame).toBe(true);
  });
});
