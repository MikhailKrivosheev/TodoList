import { describe, expect, it } from 'vitest';

import { countTodos, filterTodos, isTodoFilter } from './filter';
import type { Todo } from './types';

const todos: Todo[] = [
  { id: '1', title: 'Активная', description: '', deadline: null, completed: false, createdAt: 1 },
  { id: '2', title: 'Выполненная', description: '', deadline: null, completed: true, createdAt: 2 },
  {
    id: '3',
    title: 'Ещё активная',
    description: '',
    deadline: null,
    completed: false,
    createdAt: 3,
  },
];

describe('filterTodos', () => {
  it('all — все задачи', () => {
    expect(filterTodos(todos, 'all')).toEqual(todos);
  });

  it('active — только невыполненные', () => {
    expect(filterTodos(todos, 'active').map((todo) => todo.id)).toEqual(['1', '3']);
  });

  it('completed — только выполненные', () => {
    expect(filterTodos(todos, 'completed').map((todo) => todo.id)).toEqual(['2']);
  });
});

describe('countTodos', () => {
  it('считает задачи по каждому фильтру', () => {
    expect(countTodos(todos)).toEqual({ all: 3, active: 2, completed: 1 });
    expect(countTodos([])).toEqual({ all: 0, active: 0, completed: 0 });
  });
});

describe('isTodoFilter', () => {
  it.each(['all', 'active', 'completed'])('%s — фильтр', (value) => {
    expect(isTodoFilter(value)).toBe(true);
  });

  it.each(['', 'done', null, 1])('%j — не фильтр', (value) => {
    expect(isTodoFilter(value)).toBe(false);
  });
});
