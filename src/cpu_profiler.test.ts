import { CpuProfilerBindings, importCppBindingsModule } from './cpu_profiler';
import type { ThreadCpuProfile } from './cpu_profiler';

const privateBindings = importCppBindingsModule();

function fail(message: string): never {
  throw new Error(message);
}

const fibonacci = (n: number): number => {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const profiled = async (name: string, fn: () => void) => {
  CpuProfilerBindings.startProfiling(name);
  await fn();
  return CpuProfilerBindings.stopProfiling(name);
};

const assertValidSamplesAndStacks = (stacks: ThreadCpuProfile['stacks'], samples: ThreadCpuProfile['samples']) => {
  expect(stacks.length).toBeGreaterThan(0);
  expect(samples.length).toBeGreaterThan(0);
  expect(stacks.length <= samples.length).toBe(true);

  for (const sample of samples) {
    if (sample.stack_id === undefined) {
      throw new Error(`Sample ${JSON.stringify(sample)} has not stack id associated`);
    }
    if (!stacks[sample.stack_id]) {
      throw new Error(`Failed to find stack for sample: ${JSON.stringify(sample)}`);
    }
    expect(stacks[sample.stack_id]).not.toBe(undefined);
  }

  for (const stack of stacks) {
    expect(stack).not.toBe(undefined);
  }
};

describe('Private bindings', () => {
  it('does not crash if project root is null', async () => {
    privateBindings.startProfiling('profiled-program');
    await wait(100);
    expect(() => {
      const profile = privateBindings.stopProfiling('profiled-program', 0, null, false);
      if (!profile) throw new Error('No profile');
    }).not.toThrow();
  });

  it('does not crash if collect resources is false', async () => {
    privateBindings.startProfiling('profiled-program');
    await wait(100);
    expect(() => {
      const profile = privateBindings.stopProfiling('profiled-program', 0, null, false);
      if (!profile) throw new Error('No profile');
    }).not.toThrow();
  });

  it('collects resources', async () => {
    privateBindings.startProfiling('profiled-program');
    await wait(100);

    const profile = privateBindings.stopProfiling('profiled-program', 0, null, true);
    if (!profile) throw new Error('No profile');

    expect(profile.resources.length).toBeGreaterThan(0);

    expect(new Set(profile.resources).size).toBe(profile.resources.length);

    for (const resource of profile.resources) {
      expect(typeof resource).toBe('string');
      expect(resource).not.toBe(undefined);
    }
  });

  it('does not collect resources', async () => {
    privateBindings.startProfiling('profiled-program');
    await wait(100);

    const profile = privateBindings.stopProfiling('profiled-program', 0, null, false);
    if (!profile) throw new Error('No profile');

    expect(profile.resources.length).toBe(0);
  });
});

describe('Profiler bindings', () => {
  it('exports profiler binding methods', () => {
    expect(typeof CpuProfilerBindings['startProfiling']).toBe('function');
    expect(typeof CpuProfilerBindings['stopProfiling']).toBe('function');
  });

  it('profiles a program', async () => {
    const profile = await profiled('profiled-program', async () => {
      await wait(100);
    });

    if (!profile) fail('Profile is null');

    assertValidSamplesAndStacks(profile.stacks, profile.samples);
  });

  it('adds thread_id info', async () => {
    const profile = await profiled('profiled-program', async () => {
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

  it('caps stack depth at 128', async () => {
    const recurseToDepth = async (depth: number): Promise<number> => {
      if (depth === 0) {
        // Wait a bit to make sure stack gets sampled here
        await wait(1000);
        return 0;
      }
      return await recurseToDepth(depth - 1);
    };

    const profile = await profiled('profiled-program', async () => {
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

  it('compiles with eager logging by default', async () => {
    const profile = await profiled('profiled-program', async () => {
      await wait(100);
    });

    if (!profile) fail('Profile is null');
    expect(profile.profiler_logging_mode).toBe('eager');
  });

  it('stacks are not null', async () => {
    const profile = await profiled('non nullable stack', async () => {
      await wait(1000);
      fibonacci(36);
      await wait(1000);
    });

    if (!profile) fail('Profile is null');
    assertValidSamplesAndStacks(profile.stacks, profile.samples);
  });

  it('samples at ~99hz', async () => {
    CpuProfilerBindings.startProfiling('profile');
    await wait(100);
    const profile = CpuProfilerBindings.stopProfiling('profile');

    if (!profile) fail('Profile is null');

    // Exception for macos and windows - we seem to get way less samples there, but I'm not sure if that's due to poor
    // performance of the actions runner, machine or something else. This needs more investigation to determine
    // the cause of low sample count. https://github.com/actions/runner-images/issues/1336 seems relevant.
    if (process.platform === 'darwin' || process.platform === 'win32') {
      if (profile.samples.length < 2) {
        fail('Only ' + profile.samples.length + ' samples obtained on ' + process.platform + ', expected at least 2');
      }
    } else {
      if (profile.samples.length < 6) {
        fail('Only ' + profile.samples.length + ' samples obtained on ' + process.platform + ', expected at least 6');
      }
    }
    if (profile.samples.length > 15) {
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

    const profile = await profiled('profiled-program', async () => {
      iterateOverLargeHashTable();
    });

    // @ts-expect-error deopt reasons are disabled for now as we need to figure out the backend support
    const hasDeoptimizedFrame = profile.frames.some((f) => f.deopt_reasons && f.deopt_reasons.length > 0);
    expect(hasDeoptimizedFrame).toBe(true);
  });
});
