import { useTodoStore } from '@/entities/todo';
import Button from '@/shared/ui/button';

import type { ClearCompletedButtonProps } from './types';

function ClearCompletedButton({ completedCount }: ClearCompletedButtonProps) {
  const clearCompleted = useTodoStore((state) => state.clearCompleted);

  return (
    <Button variant="danger" disabled={completedCount === 0} onClick={clearCompleted}>
      Очистить выполненные
    </Button>
  );
}

export default ClearCompletedButton;
