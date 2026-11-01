import { AppFooter } from '@/widgets/app-footer';
import { TodoList } from '@/widgets/todo-list';
import { TodoToolbar } from '@/widgets/todo-toolbar';
import { AddTodoForm } from '@/features/add-todo';
import { ThemeToggle } from '@/features/switch-theme';

import TodoSummary from '../todo-summary';

import styles from './todo-page.module.scss';

function TodoPage() {
  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>Задачи</h1>
            <ThemeToggle />
          </div>
          <TodoSummary />
        </header>
        <section className={styles.panel} aria-label="Задачи">
          <AddTodoForm />
          <TodoToolbar />
          <TodoList />
        </section>
      </main>
      <AppFooter />
    </>
  );
}

export default TodoPage;
