import type { TodoFilter } from '@/entities/todo';

export type TodoFilterTabsProps = {
  counts: Readonly<Record<TodoFilter, number>>;
};
