import { addExtensionMethods } from './hubextensions';
import { ProfilingIntegration } from './integration';

// Treeshakable guard to remove all code related to profiling
declare const __SENTRY_PROFILING: boolean;

// Guard for tree
if (typeof __SENTRY_PROFILING === 'undefined' || __SENTRY_PROFILING) {
  // We are patching the global object with our hub extension methods
  console.log('Adding extension methods to the global object');
  addExtensionMethods();
}

export { ProfilingIntegration };
export { addExtensionMethods };
