import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subscribeToTodoStorage } from './sync-tabs';
import { TODO_STORAGE_KEY, useTodoStore } from './todo-store';
import type { Todo } from './types';

function getTodos(): Todo[] {
  return useTodoStore.getState().todos;
}

function readStorage(): unknown {
  return JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) ?? 'null');
}

function writeStorage(todos: unknown[]): void {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify({ state: { todos }, version: 3 }));
}

beforeEach(() => {
  useTodoStore.setState({ todos: [] });
});

describe('useTodoStore', () => {
  it('добавляет задачу с обрезанными пробелами в начало списка', () => {
    useTodoStore.getState().addTodo({ title: 'Первая' });
    const result = useTodoStore.getState().addTodo({ title: '  Вторая  ' });

    expect(result).toEqual({ ok: true, title: 'Вторая', description: '', deadline: null });
    expect(getTodos().map((todo) => todo.title)).toEqual(['Вторая', 'Первая']);
    expect(getTodos()[0]?.completed).toBe(false);
    expect(getTodos()[0]?.id).toMatch(/^[\da-f-]{36}$/);
  });

  it('добавляет задачу с описанием', () => {
    const result = useTodoStore
      .getState()
      .addTodo({ title: 'Задача', description: '  Подробности  ' });

    expect(result).toMatchObject({ ok: true, title: 'Задача', description: 'Подробности' });
    expect(getTodos()[0]?.description).toBe('Подробности');
  });

  it('без описания сохраняет пустую строку', () => {
    useTodoStore.getState().addTodo({ title: 'Задача' });

    expect(getTodos()[0]?.description).toBe('');
    expect(getTodos()[0]?.deadline).toBeNull();
  });

  it('добавляет задачу со сроком, пустая строка — без срока', () => {
    useTodoStore.getState().addTodo({ title: 'Без срока', deadline: '' });
    useTodoStore.getState().addTodo({ title: 'Со сроком', deadline: '2026-11-05' });

    expect(getTodos().map((todo) => todo.deadline)).toEqual(['2026-11-05', null]);
  });

  it('не добавляет задачу с некорректным сроком', () => {
    expect(useTodoStore.getState().addTodo({ title: 'Задача', deadline: '2026-02-30' })).toEqual({
      ok: false,
      error: 'invalid-deadline',
    });
    expect(getTodos()).toEqual([]);
  });

  it('не добавляет пустую задачу и задачу из пробелов', () => {
    expect(useTodoStore.getState().addTodo({ title: '' })).toEqual({ ok: false, error: 'empty' });
    expect(useTodoStore.getState().addTodo({ title: '   ' })).toEqual({
      ok: false,
      error: 'empty',
    });
    expect(getTodos()).toEqual([]);
  });

  it('переключает статус задачи туда и обратно', () => {
    useTodoStore.getState().addTodo({ title: 'Задача' });
    const [todo] = getTodos();

    useTodoStore.getState().toggleTodo(todo!.id);
    expect(getTodos()[0]?.completed).toBe(true);

    useTodoStore.getState().toggleTodo(todo!.id);
    expect(getTodos()[0]?.completed).toBe(false);
  });

  it('редактирует название и описание', () => {
    useTodoStore.getState().addTodo({ title: 'Старое' });
    const id = getTodos()[0]!.id;

    const result = useTodoStore.getState().editTodo(id, {
      title: '  Новое ',
      description: ' Появилось описание ',
      deadline: '2026-11-05',
    });

    expect(result).toEqual({
      ok: true,
      title: 'Новое',
      description: 'Появилось описание',
      deadline: '2026-11-05',
    });
    expect(getTodos()[0]).toMatchObject({
      title: 'Новое',
      description: 'Появилось описание',
      deadline: '2026-11-05',
    });

    useTodoStore.getState().editTodo(id, { title: 'Новое', description: '   ', deadline: null });
    expect(getTodos()[0]).toMatchObject({ description: '', deadline: null });
  });

  it('при пустом названии ничего не меняет', () => {
    useTodoStore.getState().addTodo({ title: 'Важное', description: 'Детали' });
    const id = getTodos()[0]!.id;

    expect(useTodoStore.getState().editTodo(id, { title: ' ', description: 'Другое' })).toEqual({
      ok: false,
      error: 'empty',
    });
    expect(getTodos()[0]).toMatchObject({ title: 'Важное', description: 'Детали' });
  });

  it('удаляет задачу', () => {
    useTodoStore.getState().addTodo({ title: 'Оставить' });
    useTodoStore.getState().addTodo({ title: 'Удалить' });

    useTodoStore.getState().removeTodo(getTodos()[0]!.id);

    expect(getTodos().map((todo) => todo.title)).toEqual(['Оставить']);
  });

  it('очищает выполненные задачи', () => {
    useTodoStore.getState().addTodo({ title: 'Активная' });
    useTodoStore.getState().addTodo({ title: 'Выполненная' });
    useTodoStore.getState().toggleTodo(getTodos()[0]!.id);

    useTodoStore.getState().clearCompleted();

    expect(getTodos().map((todo) => todo.title)).toEqual(['Активная']);
  });

  it('сохраняет задачи в localStorage', () => {
    useTodoStore.getState().addTodo({ title: 'Сохранить' });

    expect(readStorage()).toEqual({ state: { todos: getTodos() }, version: 3 });
  });
});

describe('гидрация из localStorage', () => {
  const storedTodo: Todo = {
    id: 'saved',
    title: 'Из прошлой сессии',
    description: 'Сохранилось вместе с задачей',
    deadline: null,
    completed: true,
    createdAt: 1,
  };

  // Свежий модуль — как после перезагрузки страницы
  async function loadFreshStore() {
    vi.resetModules();
    const module = await import('./todo-store');

    return module.useTodoStore;
  }

  it('восстанавливает задачи после перезагрузки', async () => {
    writeStorage([storedTodo]);

    const store = await loadFreshStore();

    expect(store.getState().todos).toEqual([storedTodo]);
  });

  it('отбрасывает некорректные записи', async () => {
    writeStorage([storedTodo, { id: 'broken' }, 'garbage']);

    const store = await loadFreshStore();

    expect(store.getState().todos).toEqual([storedTodo]);
  });

  it('переносит задачи из версии 1, где не было описания', async () => {
    const { description, ...v1Todo } = storedTodo;
    localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify({ state: { todos: [v1Todo] }, version: 1 }),
    );

    const store = await loadFreshStore();

    expect(store.getState().todos).toEqual([{ ...v1Todo, description: '' }]);
  });

  it('стартует с пустым списком, если в storage не JSON', async () => {
    localStorage.setItem(TODO_STORAGE_KEY, '{not json');

    const store = await loadFreshStore();

    expect(store.getState().todos).toEqual([]);
  });
});

describe('subscribeToTodoStorage', () => {
  const otherTabTodo: Todo = {
    id: 'other',
    title: 'Из другой вкладки',
    description: '',
    deadline: null,
    completed: false,
    createdAt: 2,
  };

  function dispatchStorageEvent(key: string | null) {
    window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }));
  }

  it('подтягивает изменения из другой вкладки', async () => {
    const unsubscribe = subscribeToTodoStorage();
    writeStorage([otherTabTodo]);

    dispatchStorageEvent(TODO_STORAGE_KEY);

    await vi.waitFor(() => {
      expect(getTodos()).toEqual([otherTabTodo]);
    });
    unsubscribe();
  });

  it('игнорирует чужие ключи и не слушает после отписки', () => {
    const unsubscribe = subscribeToTodoStorage();
    writeStorage([otherTabTodo]);

    dispatchStorageEvent('another-key');
    expect(getTodos()).toEqual([]);

    unsubscribe();
    dispatchStorageEvent(TODO_STORAGE_KEY);
    expect(getTodos()).toEqual([]);
  });
});
