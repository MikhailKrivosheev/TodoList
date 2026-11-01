import { describe, expect, it } from 'vitest';

import {
  TODO_DESCRIPTION_MAX_LENGTH,
  TODO_TITLE_MAX_LENGTH,
  validateTodoDraft,
  validateTodoTitle,
} from './validation';

describe('validateTodoTitle', () => {
  it('обрезает пробелы по краям', () => {
    expect(validateTodoTitle('  Купить молоко \n')).toEqual({ ok: true, title: 'Купить молоко' });
  });

  it.each(['', '   ', '\t\n '])('отклоняет пустую строку и строку из пробелов: %j', (title) => {
    expect(validateTodoTitle(title)).toEqual({ ok: false, error: 'empty' });
  });

  it('отклоняет слишком длинный заголовок', () => {
    expect(validateTodoTitle('a'.repeat(TODO_TITLE_MAX_LENGTH + 1))).toEqual({
      ok: false,
      error: 'too-long',
    });
    expect(validateTodoTitle('a'.repeat(TODO_TITLE_MAX_LENGTH)).ok).toBe(true);
  });
});

describe('validateTodoDraft', () => {
  it('обрезает пробелы в заголовке и описании', () => {
    expect(validateTodoDraft({ title: ' Задача ', description: '\n Подробности \n' })).toEqual({
      ok: true,
      title: 'Задача',
      description: 'Подробности',
      deadline: null,
    });
  });

  it('описание и срок необязательны', () => {
    expect(validateTodoDraft({ title: 'Задача' })).toEqual({
      ok: true,
      title: 'Задача',
      description: '',
      deadline: null,
    });
    expect(validateTodoDraft({ title: 'Задача', description: '   ', deadline: '' })).toMatchObject({
      description: '',
      deadline: null,
    });
  });

  it('сначала проверяет заголовок', () => {
    expect(validateTodoDraft({ title: ' ', description: 'Описание без задачи' })).toEqual({
      ok: false,
      error: 'empty',
    });
  });

  it('отклоняет слишком длинное описание', () => {
    expect(
      validateTodoDraft({
        title: 'Задача',
        description: 'a'.repeat(TODO_DESCRIPTION_MAX_LENGTH + 1),
      }),
    ).toEqual({ ok: false, error: 'description-too-long' });
  });

  it('принимает срок-дату, в том числе прошедшую', () => {
    expect(validateTodoDraft({ title: 'Задача', deadline: '2020-01-01' })).toMatchObject({
      ok: true,
      deadline: '2020-01-01',
    });
  });

  it.each(['2026-02-30', 'завтра', '05.11.2026'])('отклоняет некорректный срок: %s', (deadline) => {
    expect(validateTodoDraft({ title: 'Задача', deadline })).toEqual({
      ok: false,
      error: 'invalid-deadline',
    });
  });
});
