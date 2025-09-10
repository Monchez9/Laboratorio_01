/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  testMatch: ['**/tests/**/*.test.ts']
};
