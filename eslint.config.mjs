import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        extends: compat.extends(
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'prettier'
        ),

        plugins: {
            '@typescript-eslint': typescriptEslint,
            prettier,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
        },

        rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/prefer-ts-expect-error': 'off',
            'prettier/prettier': ['error'],
            'linebreak-style': ['error', 'unix'],
            semi: ['error', 'always'],

            'no-multiple-empty-lines': [
                'error',
                {
                    max: 2,
                },
            ],

            curly: 'error',
            'brace-style': 'error',
        },
    },
    globalIgnores(['dist/', 'build/', '*.js', '*.cjs', '*.mjs']),
]);
