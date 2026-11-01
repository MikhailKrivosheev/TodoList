import type { DateKey } from '@/shared/lib/date';

/**
 * @property deadline срок задачи
 * @property completed выполнена ли задача: у выполненной срок не выделяется
 */
export type DeadlineBadgeProps = {
  deadline: DateKey;
  completed: boolean;
};
