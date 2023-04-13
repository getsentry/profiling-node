import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  forceExit: true,
  preset: 'ts-jest',
  collectCoverage: true,
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['benchmarks/'],
  resetMocks: true,
  restoreMocks: true,
  silent: false,
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json'
    }
  }
};

export default config;
