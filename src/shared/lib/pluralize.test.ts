import { describe, expect, it } from 'vitest';

import { pluralize } from './pluralize';

const TASK_FORMS = { one: 'задача', few: 'задачи', many: 'задач' } as const;

describe('pluralize', () => {
  it.each([
    [0, 'задач'],
    [1, 'задача'],
    [2, 'задачи'],
    [4, 'задачи'],
    [5, 'задач'],
    [11, 'задач'],
    [14, 'задач'],
    [21, 'задача'],
    [22, 'задачи'],
    [111, 'задач'],
  ])('%i → %s', (count, expected) => {
    expect(pluralize(count, TASK_FORMS)).toBe(expected);
  });
});
