module.exports = {
  root: true,
  extends: ['../../packages/config/eslint-base.cjs'],
  parserOptions: {
    project: __dirname + '/tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist', 'build'],
};
