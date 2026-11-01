import { TODO_STORAGE_KEY, useTodoStore } from './todo-store';

/**
 * Событие storage приходит только в другие вкладки, поэтому изменения из соседней вкладки
 * подтягиваем повторной гидрацией. Сама гидрация пишет в storage то же значение, и новое
 * событие не возникает — цикла нет. key === null — соседняя вкладка очистила storage целиком.
 *
 * @returns функция отписки
 */
export function subscribeToTodoStorage(): () => void {
  function handleStorage(event: StorageEvent) {
    if (
      event.storageArea === localStorage &&
      (event.key === TODO_STORAGE_KEY || event.key === null)
    ) {
      void useTodoStore.persist.rehydrate();
    }
  }

  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}
