import { describe, expect, it } from 'vitest';

import { migratePersistedTodos, TODO_STORAGE_VERSION } from './migrate-persisted-todos';

const baseTodo = { id: 'a', title: 'Задача', completed: false, createdAt: 1 };

describe('migratePersistedTodos', () => {
  it('v1: добавляет пустое описание и пустой срок', () => {
    expect(migratePersistedTodos({ todos: [baseTodo, null] }, 1)).toEqual({
      todos: [{ ...baseTodo, description: '', deadline: null }, null],
    });
  });

  it('v2: добавляет только пустой срок, описание сохраняет', () => {
    const v2Todo = { ...baseTodo, description: 'Есть' };

    expect(migratePersistedTodos({ todos: [v2Todo] }, 2)).toEqual({
      todos: [{ ...v2Todo, deadline: null }],
    });
  });

  it('не трогает данные текущей версии и данные неожиданной формы', () => {
    const current = { todos: [{ ...baseTodo, description: '', deadline: '2026-11-05' }] };

    expect(migratePersistedTodos(current, TODO_STORAGE_VERSION)).toBe(current);
    expect(migratePersistedTodos('garbage', 1)).toBe('garbage');
  });
});
