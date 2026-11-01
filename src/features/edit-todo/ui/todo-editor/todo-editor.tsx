import cn from 'classnames';

import { TODO_DESCRIPTION_MAX_LENGTH, TODO_TITLE_MAX_LENGTH } from '@/entities/todo';
import Button from '@/shared/ui/button';
import DatePicker from '@/shared/ui/date-picker';

import { useTodoEditor } from '../../model/use-todo-editor';
import type { TodoEditorProps } from './types';

import styles from './todo-editor.module.scss';

function TodoEditor({ todo, onClose }: TodoEditorProps) {
  const {
    title,
    description,
    deadline,
    isTitleInvalid,
    formRef,
    cancel,
    handleSubmit,
    handleBlur,
    handleFocusOut,
    handleEscapeKeyDown,
    handleTitleChange,
    handleDescriptionChange,
    handleDescriptionKeyDown,
    changeDeadline,
  } = useTodoEditor(todo, onClose);

  const titleClasses = cn(styles.title, isTitleInvalid && styles.titleInvalid);

  return (
    <form ref={formRef} className={styles.editor} noValidate onSubmit={handleSubmit}>
      <input
        className={titleClasses}
        value={title}
        maxLength={TODO_TITLE_MAX_LENGTH}
        enterKeyHint="done"
        aria-label={`Новое название задачи «${todo.title}»`}
        aria-invalid={isTitleInvalid}
        // eslint-disable-next-line jsx-a11y-x/no-autofocus -- поле появляется по явному действию пользователя
        autoFocus
        onChange={handleTitleChange}
        onKeyDown={handleEscapeKeyDown}
        onBlur={handleBlur}
      />
      <textarea
        className={styles.description}
        value={description}
        placeholder="Добавить описание…"
        rows={1}
        maxLength={TODO_DESCRIPTION_MAX_LENGTH}
        aria-label={`Новое описание задачи «${todo.title}»`}
        onChange={handleDescriptionChange}
        onKeyDown={handleDescriptionKeyDown}
        onBlur={handleBlur}
      />
      <div className={styles.deadline}>
        Срок
        <DatePicker
          value={deadline}
          label={`Срок задачи «${todo.title}»`}
          placeholder="Без срока"
          onChange={changeDeadline}
          onTriggerKeyDown={handleEscapeKeyDown}
          onFocusOut={handleFocusOut}
        />
      </div>
      <div className={styles.footer}>
        <span className={styles.hint}>Ctrl / ⌘ + Enter — сохранить, Esc — отмена</span>
        <Button variant="ghost" onClick={cancel}>
          Отмена
        </Button>
        <Button type="submit" variant="soft">
          Сохранить
        </Button>
      </div>
    </form>
  );
}

export default TodoEditor;
