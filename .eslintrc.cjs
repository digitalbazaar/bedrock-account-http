module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'digitalbazaar',
    'digitalbazaar/jsdoc',
    'digitalbazaar/module'
  ],
  ignorePatterns: ['dist/'],
  rules: {
    'unicorn/prefer-node-protocol': 'error'
  }
};
