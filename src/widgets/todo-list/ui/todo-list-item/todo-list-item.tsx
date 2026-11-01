import { useState } from 'react';

import { DeleteTodoButton } from '@/features/delete-todo';
import { TodoEditor } from '@/features/edit-todo';
import { ToggleTodoCheckbox } from '@/features/toggle-todo';
import { TodoCard } from '@/entities/todo';
import IconButton from '@/shared/ui/icon-button';
import PencilIcon from '@/shared/ui/icons/pencil-icon';

import type { TodoListItemProps } from './types';

function TodoListItem({ todo }: TodoListItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const editor = isEditing ? (
    <TodoEditor
      todo={todo}
      onClose={() => {
        setIsEditing(false);
      }}
    />
  ) : undefined;

  return (
    <TodoCard
      todo={todo}
      control={<ToggleTodoCheckbox todo={todo} />}
      editor={editor}
      actions={
        <>
          {!isEditing && (
            <IconButton
              label={`Редактировать задачу «${todo.title}»`}
              icon={<PencilIcon />}
              onClick={() => {
                setIsEditing(true);
              }}
            />
          )}
          <DeleteTodoButton todo={todo} />
        </>
      }
    />
  );
}

export default TodoListItem;
