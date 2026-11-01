import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { migratePersistedTodos, TODO_STORAGE_VERSION } from '../lib/migrate-persisted-todos';
import { parsePersistedTodos } from '../lib/parse-persisted-todos';
import type { Todo, TodoDraft, TodoId } from './types';
import { validateTodoDraft, type TodoDraftValidation } from './validation';

export const TODO_STORAGE_KEY = 'zaloghub-todos';

type TodoState = {
  todos: Todo[];
};

type TodoActions = {
  addTodo: (draft: TodoDraft) => TodoDraftValidation;
  toggleTodo: (id: TodoId) => void;
  editTodo: (id: TodoId, draft: TodoDraft) => TodoDraftValidation;
  removeTodo: (id: TodoId) => void;
  clearCompleted: () => void;
};

export type TodoStore = TodoState & TodoActions;

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],

      addTodo: (draft) => {
        const validation = validateTodoDraft(draft);
        if (validation.ok) {
          const todo: Todo = {
            id: crypto.randomUUID(),
            title: validation.title,
            description: validation.description,
            deadline: validation.deadline,
            completed: false,
            createdAt: Date.now(),
          };
          set((state) => ({ todos: [todo, ...state.todos] }));
        }

        return validation;
      },

      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        }));
      },

      editTodo: (id, draft) => {
        const validation = validateTodoDraft(draft);
        if (validation.ok) {
          const { title, description, deadline } = validation;
          set((state) => ({
            todos: state.todos.map((todo) =>
              todo.id === id ? { ...todo, title, description, deadline } : todo,
            ),
          }));
        }

        return validation;
      },

      removeTodo: (id) => {
        set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) }));
      },

      clearCompleted: () => {
        set((state) => ({ todos: state.todos.filter((todo) => !todo.completed) }));
      },
    }),
    {
      name: TODO_STORAGE_KEY,
      version: TODO_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): TodoState => ({ todos: state.todos }),
      migrate: (persisted, version) => ({
        todos: parsePersistedTodos(migratePersistedTodos(persisted, version)),
      }),
      merge: (persisted, current) => ({ ...current, todos: parsePersistedTodos(persisted) }),
    },
  ),
);

export const selectTodos = (state: TodoStore): Todo[] => state.todos;
