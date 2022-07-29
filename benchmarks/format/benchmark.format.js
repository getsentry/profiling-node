const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');
const path = require('path');
const gzip = require('zlib');

const cpu_profiler = require('./../../build/Release/cpu_profiler');
const cpu_profiler_graph = require('./../../build/Release/cpu_profiler.graph');

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
        React.createElement('div', { key: 2 }, [React.createElement('small', { key: 0 }, 'Tiny text')]),
      ]),
    ]),
  ]);
}

function render() {
  for (let i = 0; i < 2 << 12; i++) {
    ReactDOMServer.renderToString(App());
  }
}

cpu_profiler.startProfiling('Sampled format');
render();
const sampledProfile = cpu_profiler.stopProfiling('Sampled format');
cpu_profiler_graph.startProfiling('Graph format');
render();
const graphProfile = cpu_profiler_graph.stopProfiling('Graph format');

function getSize(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Path ${path} does not exist`);
  }

  return fs.statSync(path).size;
}

function compressFile(source, target) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(source);
    stream
      .pipe(gzip.createGzip({ level: 6 }))
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
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  fs.writeFileSync(path.resolve(outpath, 'cpu_profiler.graph.json'), JSON.stringify(graphProfile));
  fs.writeFileSync(path.resolve(outpath, 'cpu_profiler.sampled.json'), JSON.stringify(sampledProfile));

  await compressFile(
    path.resolve(outpath, 'cpu_profiler.graph.json'),
    path.resolve(outpath, 'cpu_profiler.graph.json.gz')
  )
    .catch((e) => console.log(e))
    .then(() => console.log('Done'));

  await compressFile(
    path.resolve(outpath, 'cpu_profiler.sampled.json'),
    path.resolve(outpath, 'cpu_profiler.sampled.json.gz')
  )
    .catch((e) => console.log(e))
    .then(() => console.log('Done'));

  console.log('graph profile size:', getSize(path.resolve(outpath, 'cpu_profiler.graph.json')));
  console.log('sampled profile size:', getSize(path.resolve(outpath, 'cpu_profiler.sampled.json')));

  console.log('graph profile size (gzipped):', getSize(path.resolve(outpath, 'cpu_profiler.graph.json.gz')));
  console.log('sampled profile size (gzipped):', getSize(path.resolve(outpath, 'cpu_profiler.sampled.json.gz')));
})();
