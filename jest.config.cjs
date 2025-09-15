/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  // Trata .ts como ESM (tu proyecto usa NodeNext)
  extensionsToTreatAsEsm: ['.ts'],

  // Transforma TS/JS con SWC
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false,
          decorators: false
        },
        target: 'es2020'
      },
      module: { type: 'es6' } // ESM
    }]
  },

  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'js', 'json'],

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/types.ts'],
  coverageReporters: ['text', 'lcov']
};
