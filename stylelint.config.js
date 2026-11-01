// CSS-модули изолируют классы файлом, поэтому без префикса: блок-элемент в kebab-case и --модификатор
const kebab = '[a-z][a-z0-9]*(-[a-z0-9]+)*';

export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['@double-great/stylelint-a11y'],
  ignoreFiles: ['dist/**', 'coverage/**'],
  rules: {
    'a11y/selector-pseudo-class-focus': true,
    'selector-class-pattern': [
      `^${kebab}(--${kebab})?$`,
      { message: 'Класс — kebab-case, модификатор через --' },
    ],
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'scss/dollar-variable-empty-line-before': null,
  },
};
