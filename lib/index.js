"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtensionMethods = void 0;
const hubextensions_1 = require("./hubextensions");
Object.defineProperty(exports, "addExtensionMethods", { enumerable: true, get: function () { return hubextensions_1.addExtensionMethods; } });
// Guard for tree
if (typeof __SENTRY_PROFILING === 'undefined' || __SENTRY_PROFILING) {
    // We are patching the global object with our hub extension methods
    (0, hubextensions_1.addExtensionMethods)();
}
