// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  // Ignore build directories and node_modules
  {
    ignores: ['dist', 'node_modules', 'bin', '**/*.d.ts'],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript rules - using recommended + stylistic
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Language options
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Custom rules
  {
    rules: {
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Disable rules that conflict with Prettier
  prettier
)
