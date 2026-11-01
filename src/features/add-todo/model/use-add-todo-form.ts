import { useRef, useState, type ChangeEvent, type SubmitEvent } from 'react';

import { useTodoStore, type TodoDraftError } from '@/entities/todo';
import type { DateKey } from '@/shared/lib/date';

/**
 * Состояние и обработчики формы добавления задачи. Описание и срок — необязательные секции:
 * кнопки для них появляются, когда введено название.
 *
 * @returns значения полей, ошибка валидации, флаги секций и встряхивания, ref поля названия
 * и обработчики для разметки
 */
export function useAddTodoForm() {
  const addTodo = useTodoStore((state) => state.addTodo);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<DateKey | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const [error, setError] = useState<TodoDraftError | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const hasTitle = title.trim().length > 0;

  // Поле секции исчезнет вместе с фокусом — возвращаем его в название
  function focusTitle() {
    titleRef.current?.focus();
  }

  function closeDescription() {
    setDescription('');
    setIsDescriptionOpen(false);
    setError(null);
    focusTitle();
  }

  function closeDeadline() {
    setDeadline(null);
    setIsDeadlineOpen(false);
    setError(null);
    focusTitle();
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = addTodo({ title, description, deadline });

    if (result.ok) {
      setTitle('');
      closeDescription();
      closeDeadline();

      return;
    }
    setError(result.error);
    setIsShaking(true);
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
    setError(null);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
    setError(null);
  }

  function changeDeadline(value: DateKey | null) {
    setDeadline(value);
    setError(null);
  }

  return {
    title,
    description,
    deadline,
    error,
    isShaking,
    isDescriptionOpen,
    isDeadlineOpen,
    canAddDescription: hasTitle && !isDescriptionOpen,
    canAddDeadline: hasTitle && !isDeadlineOpen,
    titleRef,
    handleSubmit,
    handleTitleChange,
    handleDescriptionChange,
    changeDeadline,
    openDescription: () => {
      setIsDescriptionOpen(true);
    },
    openDeadline: () => {
      setIsDeadlineOpen(true);
    },
    closeDescription,
    closeDeadline,
    stopShaking: () => {
      setIsShaking(false);
    },
  };
}
