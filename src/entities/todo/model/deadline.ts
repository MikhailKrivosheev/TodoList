import { daysBetween, fromDateKey, type DateKey } from '@/shared/lib/date';
import { pluralize } from '@/shared/lib/pluralize';

import type { Todo } from './types';

/**
 * Насколько близок срок: `overdue` — прошёл, `today` и `tomorrow` — подходит к концу,
 * `upcoming` — позже.
 */
export type DeadlineStatus = 'overdue' | 'today' | 'tomorrow' | 'upcoming';

const dayMonthFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const fullDateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * @param deadline срок задачи
 * @param today сегодняшняя дата
 * @returns насколько близок срок
 */
export function getDeadlineStatus(deadline: DateKey, today: DateKey): DeadlineStatus {
  const daysLeft = daysBetween(today, deadline);

  if (daysLeft < 0) {
    return 'overdue';
  }
  if (daysLeft === 0) {
    return 'today';
  }

  return daysLeft === 1 ? 'tomorrow' : 'upcoming';
}

/**
 * @param status насколько близок срок
 * @returns `true`, если срок прошёл или наступает сегодня или завтра — такие задачи выделяем
 */
export function isDeadlineUrgent(status: DeadlineStatus): boolean {
  return status !== 'upcoming';
}

/**
 * Короткая подпись срока для карточки и счётчика.
 *
 * @param deadline срок задачи
 * @param today сегодняшняя дата
 * @returns «сегодня», «завтра», «просрочено на 2 дня» или «5 нояб.»; год — если не текущий
 * @example
 * formatDeadline('2026-11-02', '2026-11-01'); // 'завтра'
 */
export function formatDeadline(deadline: DateKey, today: DateKey): string {
  const daysLeft = daysBetween(today, deadline);

  switch (getDeadlineStatus(deadline, today)) {
    case 'overdue': {
      const daysLate = -daysLeft;

      return `просрочено на ${daysLate} ${pluralize(daysLate, { one: 'день', few: 'дня', many: 'дней' })}`;
    }
    case 'today':
      return 'сегодня';
    case 'tomorrow':
      return 'завтра';
    case 'upcoming':
      return deadline.slice(0, 4) === today.slice(0, 4)
        ? dayMonthFormat.format(fromDateKey(deadline))
        : fullDateFormat.format(fromDateKey(deadline));
  }
}

/**
 * @param deadline срок задачи
 * @returns полная дата для подсказки: «5 ноября 2026 г.»
 */
export function formatDeadlineFull(deadline: DateKey): string {
  return fullDateFormat.format(fromDateKey(deadline));
}

/** Задача, у которой точно есть срок. */
export type TodoWithDeadline = Todo & { readonly deadline: DateKey };

/**
 * @param todos все задачи
 * @returns невыполненная задача с самым ранним сроком (просроченные — первыми);
 * при равных сроках — созданная раньше. `null`, если сроков нет
 */
export function findNearestDeadlineTodo(todos: readonly Todo[]): TodoWithDeadline | null {
  const candidates = todos.filter(
    (todo): todo is TodoWithDeadline => !todo.completed && todo.deadline !== null,
  );

  // Даты YYYY-MM-DD сравниваются как строки
  return candidates.reduce<TodoWithDeadline | null>((nearest, todo) => {
    if (
      nearest === null ||
      todo.deadline < nearest.deadline ||
      (todo.deadline === nearest.deadline && todo.createdAt < nearest.createdAt)
    ) {
      return todo;
    }

    return nearest;
  }, null);
}
