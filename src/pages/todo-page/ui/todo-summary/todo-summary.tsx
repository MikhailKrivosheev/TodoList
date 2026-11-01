import type { MouseEvent } from 'react';
import cn from 'classnames';

import { revealTodo } from '@/widgets/todo-list';
import { navigateToTodoFilter, useTodoFilter } from '@/features/filter-todos';
import {
  countTodos,
  findNearestDeadlineTodo,
  formatDeadline,
  getDeadlineStatus,
  getTodoElementId,
  isDeadlineUrgent,
  selectTodos,
  useTodoStore,
} from '@/entities/todo';
import { pluralize } from '@/shared/lib/pluralize';
import { useToday } from '@/shared/lib/use-today';

import styles from './todo-summary.module.scss';

function getCounterText(active: number, total: number): string {
  if (total === 0) {
    return 'Список пуст';
  }
  if (active === 0) {
    return 'Все задачи выполнены';
  }
  const verb = pluralize(active, { one: 'Осталась', few: 'Осталось', many: 'Осталось' });
  const noun = pluralize(active, { one: 'задача', few: 'задачи', many: 'задач' });

  return `${verb} ${active} ${noun} из ${total}`;
}

function TodoSummary() {
  const todos = useTodoStore(selectTodos);
  const filter = useTodoFilter();
  const today = useToday();
  const counts = countTodos(todos);
  const nearest = findNearestDeadlineTodo(todos);

  function handleNearestClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (nearest === null) {
      return;
    }
    if (filter === 'completed') {
      navigateToTodoFilter('all');
    }
    revealTodo(nearest.id);
  }

  const isNearestUrgent =
    nearest !== null && isDeadlineUrgent(getDeadlineStatus(nearest.deadline, today));
  const deadlineClasses = cn(styles.deadline, isNearestUrgent && styles.deadlineUrgent);

  return (
    <div className={styles.summary}>
      <p className={styles.line} aria-live="polite">
        {getCounterText(counts.active, counts.all)}
      </p>
      {nearest !== null && (
        <p className={styles.line}>
          Ближайший срок —{' '}
          <span className={styles.nearest}>
            «
            <a
              href={`#${getTodoElementId(nearest.id)}`}
              className={styles.link}
              title={nearest.title}
              onClick={handleNearestClick}
            >
              {nearest.title}
            </a>
            »,
          </span>{' '}
          <span className={deadlineClasses}>{formatDeadline(nearest.deadline, today)}</span>
        </p>
      )}
    </div>
  );
}

export default TodoSummary;
