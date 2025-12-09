module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['*.js', '!node_modules/**', '!__tests__/**'],
  testTimeout: 10000,
  verbose: true,
};
