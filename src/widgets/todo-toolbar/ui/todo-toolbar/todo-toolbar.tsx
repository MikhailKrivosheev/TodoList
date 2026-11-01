import { ClearCompletedButton } from '@/features/clear-completed';
import { TodoFilterTabs } from '@/features/filter-todos';
import { countTodos, selectTodos, useTodoStore } from '@/entities/todo';

import styles from './todo-toolbar.module.scss';

function TodoToolbar() {
  const todos = useTodoStore(selectTodos);
  const counts = countTodos(todos);

  return (
    <div className={styles.toolbar}>
      <TodoFilterTabs counts={counts} />
      <ClearCompletedButton completedCount={counts.completed} />
    </div>
  );
}

export default TodoToolbar;
