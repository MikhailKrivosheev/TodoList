import { lazy, Suspense, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { fromDateKey, toDateKey, type DateKey } from '@/shared/lib/date';
import { useToday } from '@/shared/lib/use-today';
import CalendarIcon from '@/shared/ui/icons/calendar-icon';

import CalendarSkeleton from './calendar-skeleton';
import { loadCalendar, preloadCalendar } from './load-calendar';
import type { DatePickerProps } from './types';

import styles from './date-picker.module.scss';

// отдельный чанк, нужны тому, кому нужны (открыл календарь)
const Calendar = lazy(loadCalendar);

const POPOVER_OFFSET = 6;
const VIEWPORT_GUTTER = 8;

const valueFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function addDays(key: DateKey, days: number): DateKey {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);

  return toDateKey(date);
}

function placePopover(popover: HTMLElement, trigger: HTMLElement) {
  const triggerRect = trigger.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = popover;
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const top =
    spaceBelow < height + POPOVER_OFFSET && triggerRect.top > height + POPOVER_OFFSET
      ? triggerRect.top - height - POPOVER_OFFSET
      : triggerRect.bottom + POPOVER_OFFSET;
  const left = Math.min(
    Math.max(triggerRect.left, VIEWPORT_GUTTER),
    window.innerWidth - width - VIEWPORT_GUTTER,
  );

  popover.style.top = `${Math.round(top)}px`;
  popover.style.left = `${Math.round(Math.max(left, VIEWPORT_GUTTER))}px`;
}

function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Выбрать дату',
  min,
  autoOpen = false,
  onTriggerKeyDown,
  onFocusOut,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const wasOpenOnPointerDownRef = useRef(false);
  const popoverId = useId();
  const today = useToday();

  const valueText = value === null ? placeholder : valueFormat.format(fromDateKey(value));

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    if (!isOpen || popover === null || trigger === null) {
      return undefined;
    }

    popover.showPopover();
    const update = () => {
      placePopover(popover, trigger);
    };
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(popover);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!isOpen || popover === null) {
      return undefined;
    }
    function handleToggle(event: Event) {
      if (event instanceof ToggleEvent && event.newState === 'closed') {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    }
    popover.addEventListener('toggle', handleToggle);
    popover.addEventListener('keydown', handleKeyDown);

    return () => {
      popover.removeEventListener('toggle', handleToggle);
      popover.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const picker = pickerRef.current;
    if (picker === null || onFocusOut === undefined) {
      return undefined;
    }
    function handleFocusOut(event: FocusEvent) {
      if (!(event.relatedTarget instanceof Node && picker?.contains(event.relatedTarget))) {
        onFocusOut?.(event.relatedTarget);
      }
    }
    picker.addEventListener('focusout', handleFocusOut);

    return () => {
      picker.removeEventListener('focusout', handleFocusOut);
    };
  }, [onFocusOut]);

  function close() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function select(next: DateKey | null) {
    onChange(next);
    close();
  }

  return (
    <div ref={pickerRef} className={styles.picker}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={`${label}: ${valueText}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={popoverId}
        onPointerEnter={preloadCalendar}
        onFocus={preloadCalendar}
        onPointerDown={() => {
          wasOpenOnPointerDownRef.current = isOpen;
        }}
        onClick={() => {
          setIsOpen(!wasOpenOnPointerDownRef.current && !isOpen);
          wasOpenOnPointerDownRef.current = false;
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <CalendarIcon className={styles.icon} />
        <span className={value === null ? styles.placeholder : undefined}>{valueText}</span>
      </button>
      {isOpen && (
        <div
          ref={popoverRef}
          id={popoverId}
          className={styles.popover}
          popover="auto"
          role="dialog"
          aria-label="Выбор даты"
        >
          <Suspense fallback={<CalendarSkeleton />}>
            <Calendar
              selected={value}
              min={min}
              onSelect={(date) => {
                select(date);
              }}
            />
          </Suspense>
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.footerButton}
              onClick={() => {
                select(today);
              }}
            >
              Сегодня
            </button>
            <button
              type="button"
              className={styles.footerButton}
              onClick={() => {
                select(addDays(today, 1));
              }}
            >
              Завтра
            </button>
            {value !== null && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => {
                  select(null);
                }}
              >
                Очистить
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
