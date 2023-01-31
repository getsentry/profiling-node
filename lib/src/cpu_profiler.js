"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CpuProfilerBindings = exports.importCppBindingsModule = void 0;
const worker_threads_1 = require("worker_threads");
const utils_1 = require("./utils");
const binaries_1 = require("./../scripts/binaries");
function importCppBindingsModule() {
    return require(binaries_1.target);
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
