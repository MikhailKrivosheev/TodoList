import { isRecord } from '@/shared/lib/is-record';

export const TODO_STORAGE_VERSION = 3;

/**
 * Приводит данные из storage старых версий к текущей форме, проверку оставляет parsePersistedTodos.
 * v1 → v2: у задач появилось описание. v2 → v3: появился срок.
 *
 * @param persisted состояние из storage
 * @param version версия, с которой состояние было записано
 * @returns состояние в форме текущей версии
 */
export function migratePersistedTodos(persisted: unknown, version: number): unknown {
  if (version >= TODO_STORAGE_VERSION || !isRecord(persisted) || !Array.isArray(persisted.todos)) {
    return persisted;
  }

  const defaults = {
    ...(version < 2 && { description: '' }),
    ...(version < 3 && { deadline: null }),
  };

  return {
    ...persisted,
    todos: persisted.todos.map((todo: unknown) =>
      isRecord(todo) ? { ...defaults, ...todo } : todo,
    ),
  };
}
