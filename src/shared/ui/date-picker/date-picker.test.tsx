import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type * as CalendarModule from './calendar';
import DatePicker from './date-picker';

// Загрузку чанка календаря держим вручную: так видно, что показывается, пока он грузится
const calendarModule = vi.hoisted(() => Promise.withResolvers<typeof CalendarModule>());

vi.mock('./load-calendar', () => ({
  loadCalendar: () => calendarModule.promise,
  preloadCalendar: vi.fn(),
}));

describe('DatePicker', () => {
  it('пока календарь грузится, показывает скелетон, потом — календарь', async () => {
    render(<DatePicker value={null} label="Срок" autoOpen onChange={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'Выбор даты' });
    expect(screen.getByRole('status')).toHaveTextContent('Загружаем календарь');
    expect(dialog.querySelector('[role="grid"]')).toBeNull();

    const actualCalendar = await vi.importActual<typeof CalendarModule>('./calendar');
    await act(async () => {
      calendarModule.resolve(actualCalendar);
      await calendarModule.promise;
    });

    expect(await screen.findByRole('grid')).toBeInTheDocument();
    // У DayPicker своя live-область с role=status, поэтому ищем именно текст скелетона
    expect(screen.queryByText('Загружаем календарь')).not.toBeInTheDocument();
  });

  it('начинает грузить календарь при наведении и фокусе на кнопке', async () => {
    const { preloadCalendar } = await import('./load-calendar');
    const user = userEvent.setup();
    render(<DatePicker value={null} label="Срок" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Срок: Выбрать дату' });

    await user.hover(trigger);
    expect(preloadCalendar).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(trigger).toHaveFocus();
    expect(preloadCalendar).toHaveBeenCalledTimes(2);
  });
});
