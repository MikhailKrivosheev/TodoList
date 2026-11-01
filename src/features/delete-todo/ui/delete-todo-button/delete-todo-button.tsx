import { useTodoStore } from '@/entities/todo';
import IconButton from '@/shared/ui/icon-button';
import TrashIcon from '@/shared/ui/icons/trash-icon';

import type { DeleteTodoButtonProps } from './types';

function DeleteTodoButton({ todo }: DeleteTodoButtonProps) {
  const removeTodo = useTodoStore((state) => state.removeTodo);

  return (
    <IconButton
      label={`Удалить задачу «${todo.title}»`}
      icon={<TrashIcon />}
      tone="danger"
      onClick={() => {
        removeTodo(todo.id);
      }}
    />
  );
}

export default DeleteTodoButton;
