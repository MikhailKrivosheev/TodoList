import { useId, useState } from 'react';
import cn from 'classnames';
import { AnimatePresence, m } from 'framer-motion';

import { useToday } from '@/shared/lib/use-today';
import ChevronIcon from '@/shared/ui/icons/chevron-icon';

import { getDeadlineStatus, isDeadlineUrgent } from '../../model/deadline';
import DeadlineBadge from '../deadline-badge';
import type { TodoCardProps } from './types';

import styles from './todo-card.module.scss';

function TodoCard({ todo, control, actions, editor }: TodoCardProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const descriptionId = useId();
  const today = useToday();

  const isEditing = editor !== undefined;
  const hasDescription = todo.description.length > 0 && !isEditing;
  const isDescriptionVisible = hasDescription && isDescriptionOpen;
  const deadline = isEditing ? null : todo.deadline;
  const isUrgent =
    deadline !== null && !todo.completed && isDeadlineUrgent(getDeadlineStatus(deadline, today));

  const cardClasses = cn(
    styles.card,
    todo.completed && styles.cardCompleted,
    isUrgent && styles.cardUrgent,
  );
  const toggleClasses = cn(styles.toggle, isDescriptionVisible && styles.toggleOpen);

  return (
    <div className={cardClasses}>
      {control}
      <div className={styles.body}>
        {editor ?? <span className={styles.title}>{todo.title}</span>}
        {(deadline !== null || hasDescription) && (
          <div className={styles.meta}>
            {deadline !== null && <DeadlineBadge deadline={deadline} completed={todo.completed} />}
            {hasDescription && (
              <button
                type="button"
                className={toggleClasses}
                aria-label={`Описание задачи «${todo.title}»`}
                aria-expanded={isDescriptionVisible}
                aria-controls={descriptionId}
                onClick={() => {
                  setIsDescriptionOpen(!isDescriptionOpen);
                }}
              >
                Описание
                <ChevronIcon className={styles.chevron} />
              </button>
            )}
          </div>
        )}
        <AnimatePresence initial={false}>
          {isDescriptionVisible && (
            <m.div
              key="description"
              id={descriptionId}
              className={styles.descriptionWrapper}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <p className={styles.description}>{todo.description}</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
      {actions !== undefined && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export default TodoCard;
