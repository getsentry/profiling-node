import { CpuProfilerBindings } from '../cpu_profiler';
import type { ThreadCpuProfile } from '../cpu_profiler';

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

    assertValidSamplesAndStacks(profile.stacks, profile.samples);
  });

  it('adds thread_id info', () => {
    const profile = profiled('profiled-program', async () => {
      await wait(100);
    });

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

    for (const stack of profile.stacks) {
      expect(stack.length).toBeLessThanOrEqual(128);
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
