import { getTodoElementId, type TodoId } from '@/entities/todo';

const WAIT_FOR_ELEMENT_MS = 1000;

/**
 * Прокручивает список к задаче и коротко подсвечивает её.
 *
 * @param id идентификатор задачи
 */
export function revealTodo(id: TodoId): void {
  const startedAt = performance.now();

  function attempt() {
    const element = document.getElementById(getTodoElementId(id));
    if (!element) {
      if (performance.now() - startedAt < WAIT_FOR_ELEMENT_MS) {
        requestAnimationFrame(attempt);
      }

      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });

    delete element.dataset.highlighted;
    requestAnimationFrame(() => {
      element.dataset.highlighted = 'true';
      element.addEventListener(
        'animationend',
        () => {
          delete element.dataset.highlighted;
        },
        { once: true },
      );
    });
  }

  attempt();
}
