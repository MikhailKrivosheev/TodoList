import type { ComponentPropsWithRef, ReactNode } from 'react';

export type IconButtonTone = 'neutral' | 'danger';

/**
 * Пропсы кнопки-иконки.
 *
 * @property label доступное имя и всплывающая подсказка: видимого текста у кнопки нет
 * @property icon иконка внутри кнопки
 * @property tone цвет при наведении: `neutral` — акцентный, `danger` — для удаления
 */
export type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> & {
  label: string;
  icon: ReactNode;
  tone?: IconButtonTone;
};
