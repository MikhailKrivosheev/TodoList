import type { Todo } from './types';

export const TODO_FILTERS = ['all', 'active', 'completed'] as const;

export type TodoFilter = (typeof TODO_FILTERS)[number];

export function isTodoFilter(value: unknown): value is TodoFilter {
  return TODO_FILTERS.some((filter) => filter === value);
}

export function matchesTodoFilter(todo: Todo, filter: TodoFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'active':
      return !todo.completed;
    case 'completed':
      return todo.completed;
  }
}

export function filterTodos(todos: readonly Todo[], filter: TodoFilter): Todo[] {
  return todos.filter((todo) => matchesTodoFilter(todo, filter));
}

export function countTodos(todos: readonly Todo[]): Record<TodoFilter, number> {
  const completed = todos.filter((todo) => todo.completed).length;

  return { all: todos.length, active: todos.length - completed, completed };
}
