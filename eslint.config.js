import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // v1 assets are replaced in milestone M7; built and generated files are not source.
    ignores: ['node_modules/', 'dist/', 'assets/', 'test-results/', 'playwright-report/', 'blob-report/'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'v2/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['build/**/*.mjs', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Tests run in Node but pass callbacks that execute in the browser.
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
