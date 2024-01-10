module.exports = {
  root: true,
  env: {
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: ['@sentry-internal/sdk/src/base'],
  ignorePatterns: [
    'coverage/**',
    'build/**',
    'dist/**',
    'cjs/**',
    'esm/**',
    'examples/**',
    'test/manual/**',
    'types/**',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
    {
      files: ['test/**/*.ts', 'test/**/*.tsx'],
      parserOptions: {
        project: ['tsconfig.test.json'],
      },
    },
    {
      files: ['jest/**/*.ts', 'scripts/**/*.ts'],
      parserOptions: {
        project: ['tsconfig.dev.json'],
      },
    },
    {
      files: ['*.tsx'],
      rules: {
        // Turn off jsdoc on tsx files until jsdoc is fixed for tsx files
        // See: https://github.com/getsentry/sentry-javascript/issues/3871
        'jsdoc/require-jsdoc': 'off',
      },
    },
    {
      files: ['scenarios/**', 'dev-packages/rollup-utils/**'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};