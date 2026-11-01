import { describe, expect, it } from 'vitest';

import { daysBetween, fromDateKey, isDateKey, toDateKey } from './date';

describe('isDateKey', () => {
  it.each(['2026-11-01', '2028-02-29'])('%s — дата', (value) => {
    expect(isDateKey(value)).toBe(true);
  });

  it.each(['2026-02-30', '2027-02-29', '2026-13-01', '2026-1-1', '01.11.2026', '', null, 20261101])(
    '%j — не дата',
    (value) => {
      expect(isDateKey(value)).toBe(false);
    },
  );
});

describe('toDateKey и fromDateKey', () => {
  it('переводят дату туда и обратно в локальном часовом поясе', () => {
    const date = new Date(2026, 0, 5, 23, 59);

    expect(toDateKey(date)).toBe('2026-01-05');
    expect(fromDateKey('2026-01-05')).toEqual(new Date(2026, 0, 5));
  });
});

describe('daysBetween', () => {
  it('считает календарные дни', () => {
    expect(daysBetween('2026-11-01', '2026-11-01')).toBe(0);
    expect(daysBetween('2026-11-01', '2026-11-02')).toBe(1);
    expect(daysBetween('2026-11-03', '2026-11-01')).toBe(-2);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('не сбивается на переходе на летнее время', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
  });
});
