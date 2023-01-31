"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuProfilerBindings = exports.importCppBindingsModule = void 0;
const worker_threads_1 = require("worker_threads");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const detect_libc_1 = require("detect-libc");
const node_abi_1 = require("node-abi");
function importCppBindingsModule() {
    const family = (0, detect_libc_1.familySync)();
    const arch = process.env['BUILD_ARCH'] || os_1.default.arch();
    if (family === null) {
        // If we did not find libc or musl, we may be on Windows or some other platform.
        return require(path_1.default.join(__dirname, '..', 'binaries', `sentry_cpu_profiler-v${(0, node_abi_1.getAbi)(process.versions.node, 'node')}-${os_1.default.platform()}-${arch}.node`));
    }
    return require(path_1.default.join(__dirname, '..', 'binaries', `sentry_cpu_profiler-v${(0, node_abi_1.getAbi)(process.versions.node, 'node')}-${os_1.default.platform()}-${arch}-${family}.node`));
}
exports.importCppBindingsModule = importCppBindingsModule;
// Resolve the project root dir so we can try and compute a filename relative to it.
// We forward this to C++ code so we dont end up post-processing frames in JS.
const projectRootDirectory = (0, utils_1.getProjectRootDirectory)();
const privateBindings = importCppBindingsModule();
const CpuProfilerBindings = {
    startProfiling(name) {
        return privateBindings.startProfiling(name);
    },
    stopProfiling(name) {
        return privateBindings.stopProfiling(name, worker_threads_1.threadId, projectRootDirectory);
    }
};
exports.CpuProfilerBindings = CpuProfilerBindings;
