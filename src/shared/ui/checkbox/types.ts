import type { ComponentPropsWithRef } from 'react';

/**
 * Пропсы чекбокса: нативный input под рисованным квадратом.
 *
 * @property checked отмечен ли чекбокс, компонент только контролируемый
 * @property label доступное имя: рядом нет связанного `<label>`
 */
export type CheckboxProps = Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'checked' | 'aria-label'
> & {
  checked: boolean;
  label: string;
};
