import {
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type SubmitEvent,
} from 'react';

import { useTodoStore, type Todo } from '@/entities/todo';
import type { DateKey } from '@/shared/lib/date';
import { submitFormOnModEnter } from '@/shared/lib/keyboard';

/**
 * Состояние и обработчики редактора задачи. Enter в названии, Ctrl/⌘ + Enter в описании и уход
 * фокуса из редактора сохраняют, Escape отменяет. Пустое название при явном сохранении
 * подсвечивается, а при уходе фокуса правка отбрасывается — иначе редактор не закрыть кликом мимо.
 *
 * @param todo задача, которую редактируем
 * @param onClose вызывается после сохранения или отмены
 * @returns значения полей, флаг ошибки названия, ref формы и обработчики
 */
export function useTodoEditor(todo: Todo, onClose: () => void) {
  const editTodo = useTodoStore((state) => state.editTodo);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [deadline, setDeadline] = useState<DateKey | null>(todo.deadline);
  const [isTitleInvalid, setIsTitleInvalid] = useState(false);
  const isClosedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  function close() {
    if (isClosedRef.current) {
      return;
    }
    isClosedRef.current = true;
    onClose();
  }

  function save({ discardInvalid }: { discardInvalid: boolean }) {
    if (isClosedRef.current) {
      return;
    }
    const result = editTodo(todo.id, { title, description, deadline });
    if (result.ok || discardInvalid) {
      close();

      return;
    }
    setIsTitleInvalid(true);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    save({ discardInvalid: false });
  }

  // Фокус перешёл между полями, кнопками и календарём редактора — это ещё не уход из него
  function handleFocusOut(nextFocused: EventTarget | null) {
    if (nextFocused instanceof Node && formRef.current?.contains(nextFocused)) {
      return;
    }
    save({ discardInvalid: true });
  }

  function handleBlur(event: FocusEvent) {
    handleFocusOut(event.relatedTarget);
  }

  function handleEscapeKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }

  function handleDescriptionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    submitFormOnModEnter(event);
    if (event.key === 'Escape') {
      close();
    }
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
    setIsTitleInvalid(false);
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
  }

  return {
    title,
    description,
    deadline,
    isTitleInvalid,
    formRef,
    cancel: close,
    handleSubmit,
    handleBlur,
    handleFocusOut,
    handleEscapeKeyDown,
    handleTitleChange,
    handleDescriptionChange,
    handleDescriptionKeyDown,
    changeDeadline: setDeadline,
  };
}
