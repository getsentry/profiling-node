const fs = require('fs');
const cpu_profiler = require('./build/Release/cpu_profiler');

(async function iife() {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const start = performance.now();
  cpu_profiler.startProfiling('test');

  function fib(number) {
    let n1 = 0,
      n2 = 1,
      nextTerm;

    for (let i = 1; i <= number; i++) {
      nextTerm = n1 + n2;
      n1 = n2;
      n2 = nextTerm;
    }
  }

  for (let i = 0; i < 10; i++) {
    fib(1024);
    await wait(20);
  }

  const profile = cpu_profiler.stopProfiling('test');

  fs.writeFileSync('formats/profile.json', JSON.stringify(profile));

  if (cpu_profiler.format === 2) {
    const { frames, sampleTimes, ...rest } = profile;

    const sentryProfile = {
      transactionName: 'test',
      activeProfileIndex: 0,
      profileID: 'ee6851adf6014de8af8ca517217ac481',
      profiles: [
        {
          ...rest
        }
      ],
      shared: { frames }
    };

    console.log('Sampled profile');
    fs.writeFileSync('formats/profile.sampled.json', JSON.stringify(sentryProfile, null, 2));
  } else if (cpu_profiler.format === 1) {
    fs.writeFileSync('formats/profile.raw.json', JSON.stringify(profile, null, 2));
  } else {
    throw new Error('Unrecognized output');
  }
})();
