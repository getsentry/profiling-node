import { CpuProfiler } from '../cpu_profiler';
import type { CpuProfile } from '../cpu_profiler';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const profiled = (name: string, fn: () => void) => {
  CpuProfiler.startProfiling(name);
  fn();
  return CpuProfiler.stopProfiling(name);
};

const assertDeoptReasons = (frames: CpuProfile['frames']) => {
  const hasDeoptimizedFrame = frames.some((f) => f.deoptReasons && f.deoptReasons.length > 0);
  expect(hasDeoptimizedFrame).toBe(true);
};
const assertValidWeights = (weights: number[]) => {
  const isValidWeights = Array.isArray(weights) && weights.every((w) => w >= 0);
  expect(isValidWeights).toBe(true);
};
const assertValidSamples = (samples: number[][]) => {
  const isValidSamples =
    Array.isArray(samples) &&
    samples.every((s) => {
      return Array.isArray(s) && s.every((v) => v >= 0);
    });

  expect(isValidSamples).toBe(true);
};

const assertWeightsToSamples = (weights: number[], samples: number[][]) => {
  expect(weights.length).toBe(samples.length);
};

describe('Profiler bindings', () => {
  it('exports profiler binding methods', () => {
    expect(typeof CpuProfiler['startProfiling']).toBe('function');
    expect(typeof CpuProfiler['stopProfiling']).toBe('function');
    expect(typeof CpuProfiler['setSamplingInterval']).toBe('function');
    expect(typeof CpuProfiler['setUsePreciseSampling']).toBe('function');
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
    const resultStore: { result?: number } = {
      result: 0
    };

    function addPolymorphic(arr: any[], i: number) {
        %GetOptimizationStatus(addPolymorphic);
      try {
        // @ts-expect-error abc
        if (result[i - 1]) {
          // @ts-expect-error abc
          delete resultStore[i - 1];
        }
        // @ts-expect-error abc
        resultStore[i] = arr[i] + 1;
        return arr[0] + arr[1];
      } catch (e) {
        return 0;
      }
    }

    const profile = profiled('profiled-program', async () => {
      let i = 0;
      while (i < 1e4) {
        addPolymorphic(i % 2 ? [i, i] : [String(i), String(i)], i);
        i++;
      }
    });

    console.log(profile.frames.find((f) => f.deoptReasons));
    assertDeoptReasons(profile.frames);
  });
});
