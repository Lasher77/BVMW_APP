/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^isomorphic-dompurify$': '<rootDir>/tests/__mocks__/isomorphic-dompurify.ts',
    '^@prisma/client$': '<rootDir>/tests/__mocks__/prismaClient.ts',
  },
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  transformIgnorePatterns: ['node_modules/(?!(isomorphic-dompurify|jsdom|parse5)/)'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};
