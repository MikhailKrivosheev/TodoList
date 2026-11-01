import type { KeyboardEventHandler } from 'react';

import type { DateKey } from '@/shared/lib/date';

/**
 * Пропсы поля выбора даты.
 *
 * @property value выбранная дата; `null` — не выбрана
 * @property onChange вызывается с новой датой или `null` при очистке
 * @property label доступное имя кнопки, к нему добавляется выбранная дата
 * @property placeholder текст кнопки, когда дата не выбрана
 * @property min самая ранняя дата, которую можно выбрать
 * @property autoOpen открыть календарь сразу при появлении поля
 * @property onTriggerKeyDown нажатие клавиши на кнопке, например Escape для закрытия редактора
 * @property onFocusOut фокус ушёл из поля и календаря; получает элемент, на который он перешёл
 */
export type DatePickerProps = {
  value: DateKey | null;
  onChange: (value: DateKey | null) => void;
  label: string;
  placeholder?: string;
  min?: DateKey;
  autoOpen?: boolean;
  onTriggerKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  onFocusOut?: (nextFocused: EventTarget | null) => void;
};

/**
 * @property selected выбранная дата
 * @property min самая ранняя доступная дата
 * @property onSelect вызывается при выборе дня
 */
export type CalendarProps = {
  selected: DateKey | null;
  min: DateKey | undefined;
  onSelect: (value: DateKey) => void;
};
