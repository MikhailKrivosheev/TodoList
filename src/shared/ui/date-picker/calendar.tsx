import { DayFlag, DayPicker, SelectionState, UI, type ClassNames } from '@daypicker/react';
import { ru } from '@daypicker/react/locale/ru';
import cn from 'classnames';

import { fromDateKey, toDateKey } from '@/shared/lib/date';
import { useToday } from '@/shared/lib/use-today';
import ChevronIcon from '@/shared/ui/icons/chevron-icon';

import type { CalendarProps } from './types';

import styles from './calendar.module.scss';

const CLASS_NAME_ENTRIES: [keyof ClassNames, string | undefined][] = [
  [UI.Root, styles.root],
  [UI.Months, styles.months],
  [UI.Month, styles.month],
  [UI.MonthCaption, styles.caption],
  [UI.CaptionLabel, styles.captionLabel],
  [UI.Nav, styles.nav],
  [UI.PreviousMonthButton, styles.navButton],
  [UI.NextMonthButton, styles.navButton],
  [UI.MonthGrid, styles.grid],
  [UI.Weekday, styles.weekday],
  [UI.Day, styles.day],
  [UI.DayButton, styles.dayButton],
  [SelectionState.selected, styles.selected],
  [DayFlag.today, styles.today],
  [DayFlag.outside, styles.outside],
  [DayFlag.disabled, styles.disabled],
];

const CLASS_NAMES = CLASS_NAME_ENTRIES.reduce<Partial<ClassNames>>((classNames, [key, value]) => {
  if (value !== undefined) {
    classNames[key] = value;
  }

  return classNames;
}, {});

const CHEVRON_ROTATION = { left: 90, right: -90, up: 180, down: 0 } as const;

function CalendarChevron({
  orientation = 'down',
  className,
}: {
  orientation?: keyof typeof CHEVRON_ROTATION;
  className?: string;
}) {
  return (
    <ChevronIcon
      className={cn(styles.chevron, className)}
      style={{ transform: `rotate(${CHEVRON_ROTATION[orientation]}deg)` }}
    />
  );
}

function Calendar({ selected, min, onSelect }: CalendarProps) {
  const today = useToday();
  const selectedDate = selected === null ? undefined : fromDateKey(selected);
  const minDate = min === undefined ? undefined : fromDateKey(min);

  return (
    <DayPicker
      mode="single"
      locale={ru}
      weekStartsOn={1}
      selected={selectedDate}
      defaultMonth={selectedDate ?? minDate ?? fromDateKey(today)}
      disabled={minDate === undefined ? undefined : { before: minDate }}
      classNames={CLASS_NAMES}
      components={{ Chevron: CalendarChevron }}
      required
      showOutsideDays
      // eslint-disable-next-line jsx-a11y-x/no-autofocus -- календарь открыт явным действием, стрелки сразу работают по дням
      autoFocus
      onSelect={(date) => {
        onSelect(toDateKey(date));
      }}
    />
  );
}

export default Calendar;
