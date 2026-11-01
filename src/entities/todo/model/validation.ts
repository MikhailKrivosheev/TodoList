import { isDateKey, type DateKey } from '@/shared/lib/date';

import type { TodoDraft } from './types';

export const TODO_TITLE_MAX_LENGTH = 200;
export const TODO_DESCRIPTION_MAX_LENGTH = 1000;

/**
 * Код ошибки названия: `empty` — пустое или из одних пробелов,
 * `too-long` — длиннее {@link TODO_TITLE_MAX_LENGTH}.
 */
export type TodoTitleError = 'empty' | 'too-long';

export type TodoTitleValidation =
  | { readonly ok: true; readonly title: string }
  | { readonly ok: false; readonly error: TodoTitleError };

/**
 * Код ошибки задачи целиком: ошибки названия, `description-too-long` — описание длиннее
 * {@link TODO_DESCRIPTION_MAX_LENGTH}, `invalid-deadline` — срок не является датой.
 */
export type TodoDraftError = TodoTitleError | 'description-too-long' | 'invalid-deadline';

export type TodoDraftValidation =
  | {
      readonly ok: true;
      readonly title: string;
      readonly description: string;
      readonly deadline: DateKey | null;
    }
  | { readonly ok: false; readonly error: TodoDraftError };

/**
 * @param rawTitle название как его ввёл пользователь
 * @returns `ok: true` и название без пробелов по краям либо `ok: false` и код ошибки
 */
export function validateTodoTitle(rawTitle: string): TodoTitleValidation {
  const title = rawTitle.trim();

  if (title.length === 0) {
    return { ok: false, error: 'empty' };
  }
  if (title.length > TODO_TITLE_MAX_LENGTH) {
    return { ok: false, error: 'too-long' };
  }

  return { ok: true, title };
}

/**
 * Проверяет задачу перед сохранением. Название проверяется первым. Прошедший срок допустим:
 * его могли поставить вчера, и при редактировании задача не должна становиться невалидной.
 *
 * @param draft данные задачи как их ввёл пользователь
 * @returns `ok: true` и очищенные поля либо `ok: false` и код ошибки
 */
export function validateTodoDraft({
  title: rawTitle,
  description: rawDescription = '',
  deadline: rawDeadline = null,
}: TodoDraft): TodoDraftValidation {
  const titleValidation = validateTodoTitle(rawTitle);
  if (!titleValidation.ok) {
    return titleValidation;
  }

  const description = rawDescription.trim();
  if (description.length > TODO_DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: 'description-too-long' };
  }

  const deadline = rawDeadline === '' ? null : rawDeadline;
  if (deadline !== null && !isDateKey(deadline)) {
    return { ok: false, error: 'invalid-deadline' };
  }

  return { ok: true, title: titleValidation.title, description, deadline };
}
