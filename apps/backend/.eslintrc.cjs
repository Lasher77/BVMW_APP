module.exports = {
  root: true,
  extends: ['../../packages/config/eslint-base.cjs'],
  parserOptions: {
    project: __dirname + '/tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist', 'prisma/migrations/**'],
};
