import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: {
    overrides: {
      'ts/consistent-type-imports': 0,
    },
  },

  rules: {
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-imports': 'off',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },

}, {
  ignores: ['**/prisma*/*', 'node_modules/*', 'dist/*', 'migrations/**/*', '**/*.yaml', '**/*.md'],
})
