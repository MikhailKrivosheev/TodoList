import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettierCompat from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities'];

function layerBoundaries(layer) {
  const forbidden = LAYERS.slice(0, LAYERS.indexOf(layer));
  if (SLICED_LAYERS.includes(layer)) {
    forbidden.push(layer);
  }

  return {
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...(forbidden.length > 0
              ? [
                  {
                    group: forbidden.flatMap((name) => [`@/${name}`, `@/${name}/**`]),
                    message: `FSD: слой «${layer}» не может импортировать из своего слоя или слоёв выше.`,
                  },
                ]
              : []),
            {
              regex: `^@/(${SLICED_LAYERS.join('|')})/[^/]+/.+`,
              message: 'FSD: импортируйте слайс через его публичный API (index.ts).',
            },
          ],
        },
      ],
    },
  };
}

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  js.configs.recommended,
  {
    files: ['*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      eslintReact.configs['strict-type-checked'],
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      jsxA11y.configs.strict,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  prettierCompat,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@stylistic': stylistic, perfectionist },
    rules: {
      curly: 'error',
      eqeqeq: 'error',
      'no-console': 'error',
      'no-nested-ternary': 'error',
      'id-length': ['error', { min: 2, properties: 'never', exceptions: ['_'] }],
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: false,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
      // Деструктуризацией с остатком убираем лишние поля объекта, неиспользуемые части — норма
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      '@stylistic/jsx-self-closing-comp': 'error',
      // Порядок пропсов свободный, но shorthand-флаги и обработчики on* — в конце
      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'unsorted',
          groups: ['unknown', 'shorthand-prop', 'callback'],
          customGroups: [{ groupName: 'callback', elementNamePattern: '^on[A-Z]' }],
        },
      ],
    },
  },
  ...LAYERS.map(layerBoundaries),
  {
    files: ['**/*.test.{ts,tsx}', 'src/shared/config/tests/**'],
    rules: {
      // В тестах слайсы проверяются изнутри, в обход публичного API
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]);
