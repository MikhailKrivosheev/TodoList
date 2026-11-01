import type { DateKey } from '@/shared/lib/date';

export type TodoId = string;

/**
 * Задача списка.
 *
 * @property id уникальный идентификатор, `crypto.randomUUID()`
 * @property title название без пробелов по краям, не пустое
 * @property description описание; пустая строка — описания нет
 * @property deadline срок — дата `YYYY-MM-DD`, задача должна быть сделана до конца этого дня;
 * `null` — срока нет
 * @property completed выполнена ли задача
 * @property createdAt время создания, Unix time в миллисекундах
 */
export type Todo = Readonly<{
  id: TodoId;
  title: string;
  description: string;
  deadline: DateKey | null;
  completed: boolean;
  createdAt: number;
}>;

/**
 * Данные задачи, которые вводит пользователь, до проверки.
 *
 * @property title название как его ввели
 * @property description описание; по умолчанию пустое
 * @property deadline срок `YYYY-MM-DD`; пустая строка или `null` — без срока
 */
export type TodoDraft = Readonly<{
  title: string;
  description?: string;
  deadline?: DateKey | null;
}>;
