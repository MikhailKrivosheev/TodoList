const pluralRules = new Intl.PluralRules('ru-RU');

/**
 * Три формы слова для русского языка.
 *
 * @property one 1, 21, 101 — «задача»
 * @property few 2–4, 22–24 — «задачи»
 * @property many 0, 5–20, 25 — «задач»
 */
export type PluralForms = Readonly<{
  one: string;
  few: string;
  many: string;
}>;

/**
 * Подбирает форму слова под число по правилам `Intl.PluralRules`.
 *
 * @param count число, к которому согласуем слово
 * @param forms формы слова
 * @returns форма, подходящая для `count`
 * @example
 * pluralize(3, { one: 'задача', few: 'задачи', many: 'задач' }); // 'задачи'
 */
export function pluralize(count: number, forms: PluralForms): string {
  switch (pluralRules.select(count)) {
    case 'one':
      return forms.one;
    case 'few':
      return forms.few;
    case 'zero':
    case 'two':
    case 'many':
    case 'other':
      return forms.many;
  }
}
