const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');
const path = require('path');
const gzip = require('zlib');
const { ZSTDCompress } = require('simple-zstd');

const cpu_profiler = require('../../build/Release/cpu_profiler_format_benchmark');

function App() {
  const [times, setTimes] = (function () {
    let start = 0;

    return [start, (newstart) => (start = newstart)];
  })();

  return React.createElement('div', { className: 'className' }, [
    React.createElement('main', { key: 0 }, [
      React.createElement('h1', { key: 0 }, 'Hello World'),
      React.createElement('button', { key: 1, onClick: () => setTimes(times + 1) }, 'Click me'),

      React.createElement('section', { key: 2 }, [
        React.createElement('h3', { key: 0 }, 'Subtitle'),
        React.createElement('p', { key: 1 }, 'Paragraph'),
        React.createElement('div', { key: 2 }, [React.createElement('small', { key: 0 }, 'Tiny text')])
      ])
    ])
  ]);
}

function render() {
  for (let i = 0; i < 2 << 16; i++) {
    ReactDOMServer.renderToString(App());
  }
}

cpu_profiler.startProfiling('Sampled format');
render();
const sampledProfile = cpu_profiler.stopProfiling('Sampled format');

function getSize(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Path ${path} does not exist`);
  }

  return fs.statSync(path).size;
}

function compressGzip(source, target) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(source);
    stream
      .pipe(gzip.createGzip({ level: 6 }))
      .pipe(fs.createWriteStream(target))
      .on('finish', () => {
        resolve();
      })
      .on('error', () => {
        reject(new Error('Error while compressing file', target));
        reject();
      });
  });
}

function compressBrotli(source, target) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(source);
    stream
      .pipe(gzip.createBrotliCompress())
      .pipe(fs.createWriteStream(target))
      .on('finish', () => {
        console.log('Compressed file:', target);
        resolve();
      })
      .on('error', () => {
        reject(new Error('Error while compressing file', target));
        reject();
      });
  });
}

function compressZstd(source, target) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(ZSTDCompress(3))
      .pipe(fs.createWriteStream(target))
      .on('finish', () => {
        console.log('Compressed file:', target);
        resolve();
      })
      .on('error', () => {
        reject(new Error('Error while compressing file', target));
        reject();
      });
  });
}

const outpath = path.resolve(__dirname, 'output');

const cleanGraphFormat = (format) => {
  const { frames, weights, samples, ...rest } = format;
  return rest;
};

const cleanSampledFormat = (format) => {
  const { top_down_root, ...rest } = format;
  return rest;
};

(async () => {
  fs.writeFileSync(path.resolve(outpath, 'cpu_profiler.graph.json'), JSON.stringify(cleanGraphFormat(sampledProfile)));
  fs.writeFileSync(
    path.resolve(outpath, 'cpu_profiler.sampled.json'),
    JSON.stringify(cleanSampledFormat(sampledProfile))
  );

  // Compress graph format to gzip
  await compressGzip(
    path.resolve(outpath, 'cpu_profiler.graph.json'),
    path.resolve(outpath, 'cpu_profiler.graph.json.gz')
  );

  // Compress sampled format to gzip
  await compressGzip(
    path.resolve(outpath, 'cpu_profiler.sampled.json'),
    path.resolve(outpath, 'cpu_profiler.sampled.json.gz')
  );

  // Compress graph format to Brotli
  await compressBrotli(
    path.resolve(outpath, 'cpu_profiler.graph.json'),
    path.resolve(outpath, 'cpu_profiler.graph.json.br')
  );

  // Compress sampled format to Brotli
  await compressBrotli(
    path.resolve(outpath, 'cpu_profiler.sampled.json'),
    path.resolve(outpath, 'cpu_profiler.sampled.json.br')
  )
    .catch((e) => console.log(e))
    .then(() => console.log('Done'));

  // Compress graph format to Brotli
  await compressZstd(
    path.resolve(outpath, 'cpu_profiler.graph.json'),
    path.resolve(outpath, 'cpu_profiler.graph.json.zst')
  )
    .catch((e) => console.log(e))
    .then(() => console.log('Done'));

  // Compress sampled format to Brotli
  await compressZstd(
    path.resolve(outpath, 'cpu_profiler.sampled.json'),
    path.resolve(outpath, 'cpu_profiler.sampled.json.zst')
  )
    .catch((e) => console.log(e))
    .then(() => console.log('Done'));

  console.log('graph profile size:', getSize(path.resolve(outpath, 'cpu_profiler.graph.json')));
  console.log('sampled profile size:', getSize(path.resolve(outpath, 'cpu_profiler.sampled.json')));

  console.log('graph profile size (gzipped):', getSize(path.resolve(outpath, 'cpu_profiler.graph.json.gz')));
  console.log('graph profile size (brotli):', getSize(path.resolve(outpath, 'cpu_profiler.graph.json.br')));
  console.log('graph profile size (zstd):', getSize(path.resolve(outpath, 'cpu_profiler.graph.json.zst')));
  console.log('sampled profile size (gzipped):', getSize(path.resolve(outpath, 'cpu_profiler.sampled.json.gz')));
  console.log('sampled profile size (brotli):', getSize(path.resolve(outpath, 'cpu_profiler.sampled.json.br')));
  console.log('sampled profile size (zstd):', getSize(path.resolve(outpath, 'cpu_profiler.sampled.json.zst')));
})();
