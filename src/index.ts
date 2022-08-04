import { addExtensionMethods } from './hubextensions';

// Treeshakable guard to remove all code related to profiling
declare const __SENTRY_PROFILING: boolean;

// Guard for tree
if (typeof __SENTRY_PROFILING === 'undefined' || __SENTRY_PROFILING) {
  // We are patching the global object with our hub extension methods
  addExtensionMethods();
}

export { addExtensionMethods };
