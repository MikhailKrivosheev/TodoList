import type { TodoId } from '../model/types';

/**
 * @param id идентификатор задачи
 * @returns id элемента карточки в DOM — для ссылок-якорей на задачу
 */
export function getTodoElementId(id: TodoId): string {
  return `todo-${id}`;
}
