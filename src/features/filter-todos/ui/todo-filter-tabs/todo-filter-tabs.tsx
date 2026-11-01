import type { MouseEvent } from 'react';
import cn from 'classnames';
import { m } from 'framer-motion';

import { TODO_FILTERS, type TodoFilter } from '@/entities/todo';

import {
  getTodoFilterHref,
  navigateToTodoFilter,
  useTodoFilter,
} from '../../model/use-todo-filter';
import type { TodoFilterTabsProps } from './types';

import styles from './todo-filter-tabs.module.scss';

const FILTER_LABELS: Record<TodoFilter, string> = {
  all: 'Все',
  active: 'Активные',
  completed: 'Выполненные',
};

// Клик с модификатором или средней кнопкой — открыть в новой вкладке или окне, это делает браузер
function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function TodoFilterTabs({ counts }: TodoFilterTabsProps) {
  const activeFilter = useTodoFilter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>, filter: TodoFilter) {
    if (!isPlainLeftClick(event)) {
      return;
    }
    event.preventDefault();
    if (filter !== activeFilter) {
      navigateToTodoFilter(filter);
    }
  }

  return (
    <nav className={styles.nav} aria-label="Фильтр задач">
      <ul className={styles.list}>
        {TODO_FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          const linkClasses = cn(styles.link, isActive && styles.linkActive);

          return (
            <li key={filter} className={styles.item}>
              <a
                href={getTodoFilterHref(filter)}
                className={linkClasses}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  handleClick(event, filter);
                }}
              >
                {isActive && (
                  <m.span
                    className={styles.indicator}
                    layoutId="todo-filter-indicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className={styles.label}>{FILTER_LABELS[filter]}</span>
                <span className={styles.count}>{counts[filter]}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default TodoFilterTabs;
