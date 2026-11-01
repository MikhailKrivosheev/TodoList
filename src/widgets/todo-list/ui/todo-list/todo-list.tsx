import { AnimatePresence, m, type Transition } from 'framer-motion';

import { useTodoFilter } from '@/features/filter-todos';
import {
  filterTodos,
  getTodoElementId,
  selectTodos,
  useTodoStore,
  type TodoFilter,
} from '@/entities/todo';

import TodoListItem from '../todo-list-item';

import styles from './todo-list.module.scss';

const EMPTY_STATES: Record<TodoFilter, Readonly<{ title: string; hint: string }>> = {
  all: { title: 'Задач пока нет', hint: 'Добавьте первую — она появится здесь' },
  active: { title: 'Всё сделано', hint: 'Активных задач не осталось' },
  completed: { title: 'Выполненных пока нет', hint: 'Отмечайте задачи — они появятся здесь' },
};

const ITEM_EXIT_DURATION = 0.18;

const ITEM_TRANSITION: Transition = { type: 'spring', stiffness: 520, damping: 40, mass: 0.8 };

function TodoList() {
  const todos = useTodoStore(selectTodos);
  const filter = useTodoFilter();
  const visibleTodos = filterTodos(todos, filter);
  const emptyState = EMPTY_STATES[filter];

  return (
    <AnimatePresence initial={false} mode="wait">
      <m.div
        key={filter}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <ul className={styles.list} aria-label="Список задач">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleTodos.map((todo) => (
              <m.li
                key={todo.id}
                id={getTodoElementId(todo.id)}
                className={styles.item}
                layout="position"
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32, transition: { duration: ITEM_EXIT_DURATION } }}
                transition={ITEM_TRANSITION}
              >
                <TodoListItem todo={todo} />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
        {visibleTodos.length === 0 && (
          <m.div
            className={styles.empty}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: ITEM_EXIT_DURATION }}
          >
            <p className={styles.emptyTitle}>{emptyState.title}</p>
            <p className={styles.emptyHint}>{emptyState.hint}</p>
          </m.div>
        )}
      </m.div>
    </AnimatePresence>
  );
}

export default TodoList;
