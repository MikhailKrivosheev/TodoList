import { useTodoStore } from '@/entities/todo';
import Checkbox from '@/shared/ui/checkbox';

import type { ToggleTodoCheckboxProps } from './types';

function ToggleTodoCheckbox({ todo }: ToggleTodoCheckboxProps) {
  const toggleTodo = useTodoStore((state) => state.toggleTodo);

  return (
    <Checkbox
      checked={todo.completed}
      label={todo.title}
      onChange={() => {
        toggleTodo(todo.id);
      }}
    />
  );
}

export default ToggleTodoCheckbox;
