module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname, // this is the reason this is a .js file
    project: ['./tsconfig.json'],
  },
  plugins: [
    'eslint-plugin-tsdoc',
    'eslint-plugin-import',
    'eslint-plugin-unused-imports'
  ],
  extends: [
    'es/node',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  settings: {
    'import/resolver': {
      'typescript': {
        'alwaysTryTypes': true // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/rdf-js`
      },
    }
  },
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off', // problems with optional parameters
    '@typescript-eslint/space-before-function-paren': [ 'error', 'never' ],
    'class-methods-use-this': 'off', // conflicts with functions from interfaces that sometimes don't require `this`
    'comma-dangle': ['error', 'always-multiline'],
    'dot-location': ['error', 'property'],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'max-len': ['error', { code: 120, ignoreUrls: true }],
    'no-underscore-dangle': 'off', // conflicts with external libraries
    'padding-line-between-statements': 'off',
    'tsdoc/syntax': 'error',
    'prefer-named-capture-group': 'off',

    // Import
    'sort-imports': 'off', // Disabled in favor of eslint-plugin-import
    'import/order': ['error', {
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }],
    'unused-imports/no-unused-imports-ts': 'error',
    'import/no-extraneous-dependencies': 'error'
  },
};
