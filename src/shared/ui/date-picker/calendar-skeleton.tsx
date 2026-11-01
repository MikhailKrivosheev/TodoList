import styles from './calendar-skeleton.module.scss';

const WEEKDAYS = 7;
const WEEKS = 6;

function CalendarSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-busy="true">
      <span className={styles.visuallyHidden}>Загружаем календарь</span>
      <div className={styles.header} aria-hidden="true">
        <span className={styles.caption} />
        <span className={styles.navButton} />
        <span className={styles.navButton} />
      </div>
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: WEEKDAYS }, (_, index) => (
          <span key={`weekday-${index}`} className={styles.weekday} />
        ))}
        {Array.from({ length: WEEKDAYS * WEEKS }, (_, index) => (
          <span key={`day-${index}`} className={styles.day} />
        ))}
      </div>
    </div>
  );
}

export default CalendarSkeleton;
