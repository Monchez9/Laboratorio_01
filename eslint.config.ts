// eslint.config.ts
import tseslint from 'typescript-eslint';

export default [

  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      'eslint.config.*',
      'jest.config.*'
    ],
  },


  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    rules: {
      'no-console': 'warn'
    }
  },

  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'script'
      }
    },
    rules: {}
  }
];
