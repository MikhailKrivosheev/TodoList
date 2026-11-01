import { useSyncExternalStore } from 'react';

import { isTodoFilter, type TodoFilter } from '@/entities/todo';

const FILTER_PARAM = 'filter';
const FILTER_CHANGE_EVENT = 'todo-filter-change';

/**
 * @param filter фильтр, на который ведёт ссылка; `all` убирает параметр из адреса
 * @returns путь с query и хэшем текущей страницы, остальные параметры сохраняются
 */
export function getTodoFilterHref(filter: TodoFilter): string {
  const url = new URL(window.location.href);
  if (filter === 'all') {
    url.searchParams.delete(FILTER_PARAM);
  } else {
    url.searchParams.set(FILTER_PARAM, filter);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Переключает фильтр без перезагрузки страницы и добавляет запись в историю браузера.
 *
 * @param filter новый фильтр
 */
export function navigateToTodoFilter(filter: TodoFilter): void {
  window.history.pushState(null, '', getTodoFilterHref(filter));
  window.dispatchEvent(new Event(FILTER_CHANGE_EVENT));
}

function readFilterFromUrl(): TodoFilter {
  const value = new URLSearchParams(window.location.search).get(FILTER_PARAM);

  return isTodoFilter(value) ? value : 'all';
}

function subscribeToUrl(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(FILTER_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(FILTER_CHANGE_EVENT, onChange);
  };
}

/**
 * Текущий фильтр из адреса страницы. Неизвестное значение параметра считается `all`.
 *
 * @returns фильтр и подписка на его смену при навигации и кнопках «Назад» / «Вперёд»
 */
export function useTodoFilter(): TodoFilter {
  return useSyncExternalStore(subscribeToUrl, readFilterFromUrl, () => 'all');
}
