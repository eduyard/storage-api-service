module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'editorconfig'
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  "rules": {
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-empty-interface': ['warn'],
    "@typescript-eslint/ban-ts-ignore": "off", // temporary until flow-engine can get real response, not mock
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'semi': ['error', 'always'],
    'no-unused-vars': 1,
    'spaced-comment': ['warn'],
    'no-trailing-spaces': ['warn'],
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'always-multiline'
    }],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'quotes': ['error', 'single', {
      'allowTemplateLiterals': true
    }],
    'quote-props': ['error', 'as-needed', {
      'unnecessary': true
    }]
  },
  "overrides": [{
    "files": [ "spec/tests/*.js", "spec/tests/**/*.js" ],
    "rules": {
      "no-unused-expressions": 0
    }
  }]
};

