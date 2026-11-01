import { describe, expect, it } from 'vitest';

import type { Todo } from '../model/types';
import { parsePersistedTodos } from './parse-persisted-todos';

const validTodo: Todo = {
  id: 'a',
  title: 'Задача',
  description: '',
  deadline: '2026-11-05',
  completed: false,
  createdAt: 1,
};

describe('parsePersistedTodos', () => {
  it('возвращает корректные задачи как есть', () => {
    expect(parsePersistedTodos({ todos: [validTodo] })).toEqual([validTodo]);
  });

  it.each([undefined, null, 'todos', 42, [], {}, { todos: 'nope' }])(
    'на неожиданную форму данных возвращает пустой список: %j',
    (persisted) => {
      expect(parsePersistedTodos(persisted)).toEqual([]);
    },
  );

  it('отбрасывает битые записи и оставляет корректные', () => {
    const persisted = {
      todos: [
        validTodo,
        null,
        { ...validTodo, id: 'b', title: '   ' },
        { ...validTodo, id: 'c', completed: 'yes' },
        { ...validTodo, id: 'd', createdAt: Number.NaN },
        { id: 'e', title: 'Без полей' },
        { ...validTodo, id: 'f', description: 42 },
        { ...validTodo, id: 'g', deadline: '2026-02-30' },
        { ...validTodo, id: 'h', deadline: 'завтра' },
      ],
    };

    expect(parsePersistedTodos(persisted)).toEqual([validTodo]);
  });

  it('убирает дубликаты по id', () => {
    const duplicate = { ...validTodo, title: 'Дубликат' };

    expect(parsePersistedTodos({ todos: [validTodo, duplicate] })).toEqual([validTodo]);
  });
});
