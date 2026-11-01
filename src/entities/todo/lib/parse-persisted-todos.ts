import { isDateKey } from '@/shared/lib/date';
import { isRecord } from '@/shared/lib/is-record';

import type { Todo } from '../model/types';
import { TODO_DESCRIPTION_MAX_LENGTH, TODO_TITLE_MAX_LENGTH } from '../model/validation';

function isTodo(value: unknown): value is Todo {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    value.title.length <= TODO_TITLE_MAX_LENGTH &&
    typeof value.description === 'string' &&
    value.description.length <= TODO_DESCRIPTION_MAX_LENGTH &&
    (value.deadline === null || isDateKey(value.deadline)) &&
    typeof value.completed === 'boolean' &&
    typeof value.createdAt === 'number' &&
    Number.isFinite(value.createdAt)
  );
}

/**
 * localStorage — внешний ввод: его могли поправить руками, туда могла записать старая версия
 * приложения. Берём только корректные задачи, остальное отбрасываем, а не роняем приложение.
 *
 * @param persisted состояние из storage после миграции, форма не гарантирована
 * @returns корректные задачи без дубликатов по `id`
 */
export function parsePersistedTodos(persisted: unknown): Todo[] {
  if (!isRecord(persisted) || !Array.isArray(persisted.todos)) {
    return [];
  }

  const seenIds = new Set<string>();

  return persisted.todos.filter((todo: unknown): todo is Todo => {
    if (!isTodo(todo) || seenIds.has(todo.id)) {
      return false;
    }
    seenIds.add(todo.id);

    return true;
  });
}
