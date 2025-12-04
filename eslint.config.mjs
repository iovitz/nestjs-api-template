import antfu from '@antfu/eslint-config'

export default antfu({
  yaml: false,
  toml: false,
  markdown: false,
  ignores: [
    'node_modules/*',
    'dist/*',
    'migrations/**/*',
  ],
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
    'jsonc/sort-keys': 'off',
    'style/eol-last': 'off',
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
})
