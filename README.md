<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Official Sentry Profiling SDK for NodeJS

[![npm version](https://img.shields.io/npm/v/@sentry/profiling-node.svg)](https://www.npmjs.com/package/@sentry/profiling-node)
[![npm dm](https://img.shields.io/npm/dm/@sentry/profiling-node.svg)](https://www.npmjs.com/package/@sentry/profiling-node)
[![npm dt](https://img.shields.io/npm/dt/@sentry/profiling-node.svg)](https://www.npmjs.com/package/@sentry/profiling-node)

## Installation

Profiling works as an extension of tracing so you will need both @sentry/tracing and @sentry/profiling-node installed. The minimum required major version of @sentry/node that supports profiling is 7.x.

```bash
# Using yarn
yarn add @sentry/tracing @sentry/profiling-node

# Using npm
npm install --save @sentry/tracing @sentry/profiling-node
```

## Usage

```javascript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: 'https://7fa19397baaf433f919fbe02228d5470@o1137848.ingest.sentry.io/6625302',
  debug: true,
  tracesSampleRate: 1,
  profilesSampleRate: 1, // Set profiling sampling rate.
  integrations: [new ProfilingIntegration()]
});
```

Sentry SDK will now automatically profile all transactions, even the ones which may be started as a result of using an automatic instrumentation integration.

```javascript
const transaction = Sentry.startTransaction({ name: 'some workflow' });

// The code between startTransaction and transaction.finish will be profiled

transaction.finish();
```

### Building the package from source

Profiling uses native modules to interop with the v8 javascript engine which means that you may be required to build it from source. The libraries required to successfully build the package from source are often the same libraries that are already required to build any other package which uses native modules and if your codebase uses any of those modules, there is a fairly good chance this will work out of the box. The required packages are python, make and g++.

**Windows:**
If you are building on windows, you may need to install windows-build-tools
```bash

# using yarn package manager
yarn global add windows-build-tools
# or npm package manager
npm i -g windows-build-tools
```

### Prebuilt binaries

We currently ship prebuilt binaries for a few of the most common platforms and node versions (v14-18).

- macOS x64
- Linux ARM64 (musl)
- Linux x64 (glibc)
- Windows x64
- Windows x86

For a more detailed list, see our build.yml workflow.

### Bundling

If you are looking to squeeze some extra performance or improve cold start in your application (especially true for serverless environments where modules are often evaluates on a per request basis), then we recommend you look into bundling your code. Modern JS engines are much faster at parsing and compiling JS than following long module resolution chains and reading file contents from disk. Because @sentry/profiling-node is a package that uses native node modules, bundling it is slightly different than just bundling javascript. In other words, the bundler needs to recognize that a .node file is node native binding and move it to the correct location so that it can later be used. Failing to do so will result in a MODULE_NOT_FOUND error.

The easiest way to make bundling work with @sentry/profiling-node and other modules which use native nodejs bindings is to mark the package as external - this will prevent the code from the package from being bundled, but it means that you will now need to rely on the package to be installed in your production environment.

To mark the package as external, use the following configuration:

Webpack
```js
externals: {
  "@sentry/profiling-node": "commonjs @sentry/profiling-node",
},
```

esbuild
```js
{
  entryPoints: ['index.js'],
  platform: 'node',
  bundle: true,
  external: ['@sentry/profiling-node'],
}
```

serverless-esbuild (serverless.yml)
```yml
custom:
  esbuild:
    external:
      - @sentry/profiling-node
    packagerOptions:
      scripts:
        - npm install @sentry/profiling-node
```

@TODO turbopack
@TODO vercel-ncc

### Environment flags

The default mode of the v8 CpuProfiler is kEagerLoggin which enables the profiler even when no profiles are active - this is good because it makes calls to startProfiling fast at the tradeoff for constant CPU overhead. The behavior can be controlled via the `SENTRY_PROFILER_LOGGING_MODE` environment variable with values of `eager|lazy`. If you opt to use the lazy logging mode, calls to startProfiling may be slow (depending on environment and node version, it can be in the order of a few hundred ms).

Example of starting a server with lazy logging mode.

```javascript
SENTRY_PROFILER_LOGGING_MODE=lazy node server.js
```

## FAQ 💭

### Can the profiler leak PII to Sentry?

The profiler does not collect function arguments so leaking any PII is unlikely. We only collect a subset of the values which may identify the device and os that the profiler is running on (if you are already using tracing, it is likely that these values are already being collected by the SDK).

There is one way a profiler could leak pii information, but this is unlikely and would only happen for cases where you might be creating or naming functions which might contain pii information such as

```js
eval('function scriptFor${PII_DATA}....');
```

In that case it is possible that the function name may end up being reported to Sentry.

### Are worker threads supported?

No. All instances of the profiler are scoped per thread  In practice, this means that starting a transaction on thread A and delegating work to thread B will only result in sample stacks being collected from thread A. That said, nothing should prevent you from starting a transaction on thread B concurrently which will result in two independant profiles being sent to the Sentry backend. We currently do not do any correlation between such transactions, but we would be open to exploring the possibilities. Please file an issue if you have suggestions or specific use-cases in mind.

### How much overhead will this profiler add?

The profiler uses the kEagerLogging option by default which trades off fast calls to startProfiling for a small amount of constant CPU overhead.
If you are using kEagerLogging then the tradeoff is reversed and there will be no CPU overhead while the profiler is not running, but calls to startProfiling could be slow (in our tests, this varies by environments and node versions, but could be in the order of a couple 100ms).
