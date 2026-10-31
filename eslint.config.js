import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // Built and generated files are not source.
    ignores: ['node_modules/', 'dist/', 'site/dist/', 'test-results/', 'playwright-report/', 'blob-report/', '.claude/'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'prototype/**/*.js', 'examples/**/*.js', 'site/assets/**/*.js'],
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
