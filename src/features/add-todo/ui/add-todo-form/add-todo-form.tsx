import { useId } from 'react';
import cn from 'classnames';
import { AnimatePresence, m } from 'framer-motion';

import {
  TODO_DESCRIPTION_MAX_LENGTH,
  TODO_TITLE_MAX_LENGTH,
  type TodoDraftError,
} from '@/entities/todo';
import { submitFormOnModEnter } from '@/shared/lib/keyboard';
import { useToday } from '@/shared/lib/use-today';
import Button from '@/shared/ui/button';
import DatePicker, { preloadCalendar } from '@/shared/ui/date-picker';
import IconButton from '@/shared/ui/icon-button';
import CalendarIcon from '@/shared/ui/icons/calendar-icon';
import CloseIcon from '@/shared/ui/icons/close-icon';
import NotesIcon from '@/shared/ui/icons/notes-icon';
import PlusIcon from '@/shared/ui/icons/plus-icon';

import { useAddTodoForm } from '../../model/use-add-todo-form';

import styles from './add-todo-form.module.scss';

const ERROR_MESSAGES: Record<TodoDraftError, string> = {
  empty: 'Введите текст задачи — пустую добавить нельзя',
  'too-long': `Не длиннее ${TODO_TITLE_MAX_LENGTH} символов`,
  'description-too-long': `Описание — не длиннее ${TODO_DESCRIPTION_MAX_LENGTH} символов`,
  'invalid-deadline': 'Некорректная дата срока',
};

function AddTodoForm() {
  const {
    title,
    description,
    deadline,
    error,
    isShaking,
    isDescriptionOpen,
    isDeadlineOpen,
    canAddDescription,
    canAddDeadline,
    titleRef,
    handleSubmit,
    handleTitleChange,
    handleDescriptionChange,
    changeDeadline,
    openDescription,
    openDeadline,
    closeDescription,
    closeDeadline,
    stopShaking,
  } = useAddTodoForm();
  const today = useToday();
  const inputId = useId();
  const descriptionId = useId();
  const errorId = useId();

  const fieldClasses = cn(
    styles.field,
    error !== null && styles.fieldInvalid,
    isShaking && styles.fieldShaking,
  );

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={fieldClasses} onAnimationEnd={stopShaking}>
        <div className={styles.row}>
          <label htmlFor={inputId} className={styles.visuallyHidden}>
            Новая задача
          </label>
          <input
            ref={titleRef}
            id={inputId}
            className={styles.input}
            value={title}
            placeholder="Что нужно сделать?"
            maxLength={TODO_TITLE_MAX_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            aria-invalid={error === 'empty' || error === 'too-long'}
            aria-describedby={error === null ? undefined : errorId}
            onChange={handleTitleChange}
          />
          <AnimatePresence initial={false}>
            {canAddDescription && (
              <m.div
                key="add-description"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="soft"
                  className={styles.sectionButton}
                  aria-label="Добавить описание"
                  onClick={openDescription}
                >
                  <NotesIcon />
                  <span className={styles.sectionButtonText}>Описание</span>
                </Button>
              </m.div>
            )}
            {canAddDeadline && (
              <m.div
                key="add-deadline"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant="soft"
                  className={styles.sectionButton}
                  aria-label="Добавить срок"
                  onPointerEnter={preloadCalendar}
                  onFocus={preloadCalendar}
                  onClick={openDeadline}
                >
                  <CalendarIcon />
                  <span className={styles.sectionButtonText}>Срок</span>
                </Button>
              </m.div>
            )}
          </AnimatePresence>
          <Button type="submit" className={styles.submit}>
            <PlusIcon />
            <span className={styles.submitText}>Добавить</span>
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {isDescriptionOpen && (
            <m.div
              key="description"
              className={styles.sectionWrapper}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className={styles.description}>
                <label htmlFor={descriptionId} className={styles.visuallyHidden}>
                  Описание задачи
                </label>
                <textarea
                  id={descriptionId}
                  className={styles.textarea}
                  value={description}
                  placeholder="Подробности, ссылки, заметки…"
                  rows={2}
                  maxLength={TODO_DESCRIPTION_MAX_LENGTH}
                  aria-invalid={error === 'description-too-long'}
                  // eslint-disable-next-line jsx-a11y-x/no-autofocus -- поле появляется по явному действию пользователя
                  autoFocus
                  onChange={handleDescriptionChange}
                  onKeyDown={submitFormOnModEnter}
                />
                <IconButton
                  label="Убрать описание"
                  icon={<CloseIcon />}
                  onClick={closeDescription}
                />
              </div>
              <p className={styles.hint}>Ctrl / ⌘ + Enter — добавить задачу</p>
            </m.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {isDeadlineOpen && (
            <m.div
              key="deadline"
              className={styles.sectionWrapper}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className={styles.deadline}>
                <span className={styles.deadlineLabel}>Срок</span>
                <DatePicker
                  value={deadline}
                  label="Срок"
                  min={today}
                  autoOpen
                  onChange={changeDeadline}
                />
                <IconButton label="Убрать срок" icon={<CloseIcon />} onClick={closeDeadline} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {error !== null && (
          <m.p
            key="error"
            id={errorId}
            className={styles.error}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {ERROR_MESSAGES[error]}
          </m.p>
        )}
      </AnimatePresence>
    </form>
  );
}

export default AddTodoForm;
