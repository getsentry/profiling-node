"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtensionMethods = exports.ProfilingIntegration = void 0;
const hubextensions_1 = require("./hubextensions");
Object.defineProperty(exports, "addExtensionMethods", { enumerable: true, get: function () { return hubextensions_1.addExtensionMethods; } });
const integration_1 = require("./integration");
Object.defineProperty(exports, "ProfilingIntegration", { enumerable: true, get: function () { return integration_1.ProfilingIntegration; } });
// Guard for tree
if (typeof __SENTRY_PROFILING === 'undefined' || __SENTRY_PROFILING) {
    // We are patching the global object with our hub extension methods
    console.log('Adding extension methods to the global object');
    (0, hubextensions_1.addExtensionMethods)();
}
