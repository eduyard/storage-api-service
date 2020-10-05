module.exports = {
  extends: 'standard',
  rules: {
    semi: ['error', 'always'],
    'comma-dangle': ['warn', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'only-multiline',
    }],
    camelcase: ['error', {
      properties: 'always',
      ignoreImports: true,
      ignoreDestructuring: true,
      ignoreGlobals: true,
    }],
    'no-unused-vars': 'warn',
    'no-case-declarations': 'off',
  },
};
