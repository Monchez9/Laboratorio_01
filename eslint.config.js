// Archivo desarrollado con ayuda de IA
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
export default defineConfig([
    {
        ignores: [
            'node_modules',
            'dist',
            'build',
            'coverage',
            '*.js'
        ]
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                project: './tsconfig.json'
            }
        },
        rules: {
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
            'no-console': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn'],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off'
        }
    },
    {
        files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off'
        }
    },
    tseslint.configs.recommended
]);
//# sourceMappingURL=eslint.config.js.map