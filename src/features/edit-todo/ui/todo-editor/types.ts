import type { Todo } from '@/entities/todo';

/**
 * @property todo задача, которую редактируем
 * @property onClose вызывается после сохранения или отмены
 */
export type TodoEditorProps = {
  todo: Todo;
  onClose: () => void;
};
