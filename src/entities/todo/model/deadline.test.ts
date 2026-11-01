import { describe, expect, it } from 'vitest';

import {
  findNearestDeadlineTodo,
  formatDeadline,
  formatDeadlineFull,
  getDeadlineStatus,
  isDeadlineUrgent,
} from './deadline';
import type { Todo } from './types';

const TODAY = '2026-11-01';

function createTodo(overrides: Partial<Todo>): Todo {
  return {
    id: crypto.randomUUID(),
    title: 'Задача',
    description: '',
    deadline: null,
    completed: false,
    createdAt: 1,
    ...overrides,
  };
}

describe('getDeadlineStatus и isDeadlineUrgent', () => {
  it.each([
    ['2026-10-31', 'overdue', true],
    ['2026-11-01', 'today', true],
    ['2026-11-02', 'tomorrow', true],
    ['2026-11-03', 'upcoming', false],
  ] as const)('%s → %s', (deadline, status, isUrgent) => {
    expect(getDeadlineStatus(deadline, TODAY)).toBe(status);
    expect(isDeadlineUrgent(getDeadlineStatus(deadline, TODAY))).toBe(isUrgent);
  });
});

describe('formatDeadline', () => {
  it.each([
    ['2026-10-31', 'просрочено на 1 день'],
    ['2026-10-29', 'просрочено на 3 дня'],
    ['2026-10-20', 'просрочено на 12 дней'],
    ['2026-11-01', 'сегодня'],
    ['2026-11-02', 'завтра'],
    ['2026-11-05', '5 нояб.'],
    ['2027-01-10', '10 января 2027 г.'],
  ])('%s → %s', (deadline, expected) => {
    expect(formatDeadline(deadline, TODAY)).toBe(expected);
  });

  it('formatDeadlineFull — полная дата', () => {
    expect(formatDeadlineFull('2026-11-05')).toBe('5 ноября 2026 г.');
  });
});

describe('findNearestDeadlineTodo', () => {
  it('выбирает невыполненную задачу с самым ранним сроком', () => {
    const later = createTodo({ title: 'Позже', deadline: '2026-11-10' });
    const nearest = createTodo({ title: 'Ближе', deadline: '2026-11-03' });
    const completed = createTodo({ title: 'Сделана', deadline: '2026-10-01', completed: true });
    const withoutDeadline = createTodo({ title: 'Без срока' });

    expect(findNearestDeadlineTodo([later, completed, withoutDeadline, nearest])).toBe(nearest);
  });

  it('при равных сроках — созданная раньше', () => {
    const newer = createTodo({ deadline: '2026-11-03', createdAt: 2 });
    const older = createTodo({ deadline: '2026-11-03', createdAt: 1 });

    expect(findNearestDeadlineTodo([newer, older])).toBe(older);
  });

  it('null, если сроков нет', () => {
    expect(findNearestDeadlineTodo([createTodo({}), createTodo({ completed: true })])).toBeNull();
  });
});
