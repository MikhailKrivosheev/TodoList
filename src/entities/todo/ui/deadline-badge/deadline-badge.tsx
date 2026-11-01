import cn from 'classnames';

import { useToday } from '@/shared/lib/use-today';
import CalendarIcon from '@/shared/ui/icons/calendar-icon';

import {
  formatDeadline,
  formatDeadlineFull,
  getDeadlineStatus,
  isDeadlineUrgent,
} from '../../model/deadline';
import type { DeadlineBadgeProps } from './types';

import styles from './deadline-badge.module.scss';

function DeadlineBadge({ deadline, completed }: DeadlineBadgeProps) {
  const today = useToday();
  const status = getDeadlineStatus(deadline, today);
  const isHighlighted = !completed && isDeadlineUrgent(status);

  const badgeClasses = cn(
    styles.badge,
    isHighlighted && styles.badgeUrgent,
    isHighlighted && status === 'overdue' && styles.badgeOverdue,
  );

  return (
    <time
      className={badgeClasses}
      dateTime={deadline}
      title={`Срок: ${formatDeadlineFull(deadline)}`}
    >
      <CalendarIcon className={styles.icon} />
      <span className={styles.visuallyHidden}>Срок: </span>
      {formatDeadline(deadline, today)}
    </time>
  );
}

export default DeadlineBadge;
