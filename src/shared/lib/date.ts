/** Календарная дата без времени в формате `YYYY-MM-DD`, как в `<input type="date">`. */
export type DateKey = string;

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

function parseParts(key: DateKey): [number, number, number] | null {
  const match = DATE_KEY_PATTERN.exec(key);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;

  return [Number(year), Number(month), Number(day)];
}

/**
 * @param value любое значение
 * @returns `true`, если это существующая дата в формате `YYYY-MM-DD` (не 2026-02-30)
 */
export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string') {
    return false;
  }
  const parts = parseParts(value);
  if (!parts) {
    return false;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * @param date момент времени
 * @returns его календарная дата в часовом поясе пользователя
 */
export function toDateKey(date: Date): DateKey {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * @param key дата `YYYY-MM-DD`
 * @returns полночь этой даты в часовом поясе пользователя
 */
export function fromDateKey(key: DateKey): Date {
  const [year, month, day] = parseParts(key) ?? [Number.NaN, Number.NaN, Number.NaN];

  return new Date(year, month - 1, day);
}

/**
 * Разница в календарных днях. Считается через UTC, поэтому переход на летнее время
 * не даёт 0,96 или 1,04 дня.
 *
 * @param from начальная дата
 * @param to конечная дата
 * @returns сколько дней от `from` до `to`; отрицательное, если `to` раньше
 */
export function daysBetween(from: DateKey, to: DateKey): number {
  const [fromYear, fromMonth, fromDay] = parseParts(from) ?? [0, 0, 0];
  const [toYear, toMonth, toDay] = parseParts(to) ?? [0, 0, 0];

  return Math.round(
    (Date.UTC(toYear, toMonth - 1, toDay) - Date.UTC(fromYear, fromMonth - 1, fromDay)) / MS_IN_DAY,
  );
}
