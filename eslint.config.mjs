import eslint from '@eslint/js';

import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

import globals from 'globals';

const flatConfig = [
    {
        name: 'global',
        languageOptions: {
            globals: {
                ...globals.es2025,
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': 'warn',
            'prettier/prettier': 'warn',
        },
    },
];

const customTsFlatConfig = [
    {
        name: 'typescript',
        languageOptions: {
            parser: tsEslintParser,
            sourceType: 'module',
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
            },
        },
        files: ['**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
        plugins: {
            '@typescript-eslint': tsEslintPlugin,
        },
    },
];

const jestFlatConfig = [
    {
        name: 'jest',
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
];

export default [
    eslint.configs.recommended,
    eslintPluginPrettierRecommended,
    ...flatConfig,
    ...customTsFlatConfig,
    ...jestFlatConfig,
];
