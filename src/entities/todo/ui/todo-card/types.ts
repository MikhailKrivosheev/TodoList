import type { ReactNode } from 'react';

import type { Todo } from '../../model/types';

/**
 * Пропсы карточки задачи. Карточка только раскладывает слоты, действия приходят из features.
 *
 * @property todo задача
 * @property control слот слева: переключатель статуса
 * @property actions слот справа: действия над задачей
 * @property editor заменяет текст и описание задачи, например полем редактирования
 */
export type TodoCardProps = {
  todo: Todo;
  control: ReactNode;
  actions?: ReactNode;
  editor?: ReactNode;
};
