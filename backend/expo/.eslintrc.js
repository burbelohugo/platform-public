module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
    "jest/globals": true,
  },
  extends: [
    'airbnb-base',
    "plugin:jest/style",
  ],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'max-len': 'off', // disables line length check
  },
  plugins: ['jest'],
};
