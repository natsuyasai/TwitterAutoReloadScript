import js from 'eslint-config-js';
import googleConfig from 'eslint-config-google';

export default [
  js.configs.recommended,
  googleConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    env: {
      browser: true,
      commonjs: true,
      es2021: true,
      node: true,
    },
    rules: {
      'max-len': ['error', { code: 120 }],
      'no-undef': ['error'],
    },
  },
];
