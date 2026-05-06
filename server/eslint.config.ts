import tseslint from 'typescript-eslint'

export default tseslint.config({
  extends: [tseslint.configs.recommended],
  files: ['**/*.ts'],
  ignores: ['dist'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
})
