import { CpuProfilerBindings } from '../cpu_profiler';
import type { ThreadCpuProfile } from '../cpu_profiler';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const profiled = (name: string, fn: () => void) => {
  CpuProfilerBindings.startProfiling(name);
  fn();
  return CpuProfilerBindings.stopProfiling(name);
};

const assertDeoptReasons = (frames: ThreadCpuProfile['frames']) => {
  const hasDeoptimizedFrame = frames.some((f) => f.deopt_reasons && f.deopt_reasons.length > 0);
  expect(hasDeoptimizedFrame).toBe(true);
};
const assertValidWeights = (weights: number[]) => {
  const isValidWeights = Array.isArray(weights) && weights.every((w) => w >= 0);
  expect(isValidWeights).toBe(true);
};
const assertValidSamples = (samples: number[]) => {
  const isValidSamples =
    Array.isArray(samples) &&
    samples.every((s) => {
      return Array.isArray(s) && s.every((v) => v >= 0);
    });

  expect(isValidSamples).toBe(true);
};

const assertWeightsToSamples = (weights: number[], samples: number[]) => {
  expect(weights.length).toBe(samples.length);
};

describe('Profiler bindings', () => {
  it('exports profiler binding methods', () => {
    expect(typeof CpuProfilerBindings['startProfiling']).toBe('function');
    expect(typeof CpuProfilerBindings['stopProfiling']).toBe('function');
    expect(typeof CpuProfilerBindings['setSamplingInterval']).toBe('function');
    expect(typeof CpuProfilerBindings['setUsePreciseSampling']).toBe('function');
  });

  it('profiles a program', async () => {
    const profile = profiled('profiled-program', async () => {
      await wait(500);
    });

    expect(profile.title).toBe('profiled-program');

    assertValidSamples(profile.samples);
    assertValidWeights(profile.weights);
    assertWeightsToSamples(profile.weights, profile.samples);
  });

  it('includes deopt reason', async () => {
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

    assertDeoptReasons(profile.frames);
  });
});
