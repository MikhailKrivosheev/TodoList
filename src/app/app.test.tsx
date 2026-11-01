import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTodoStore } from '@/entities/todo';

import App from './app';

function setup() {
  const user = userEvent.setup();
  render(<App />);

  const input = screen.getByRole('textbox', { name: 'Новая задача' });
  const addButton = screen.getByRole('button', { name: 'Добавить' });

  async function addTodo(title: string) {
    await user.clear(input);
    await user.type(input, title);
    await user.click(addButton);
  }

  return { user, input, addButton, addTodo };
}

function getTodoTitles(): string[] {
  const list = screen.getByRole('list', { name: 'Список задач' });

  return within(list)
    .queryAllByRole('checkbox')
    .map((checkbox) => checkbox.getAttribute('aria-label') ?? '');
}

// Удалённая карточка остаётся в DOM до конца exit-анимации AnimatePresence
async function expectTodoTitles(titles: string[]) {
  await waitFor(() => {
    expect(getTodoTitles()).toEqual(titles);
  });
}

async function selectFilter(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  await user.click(screen.getByRole('link', { name }));
  await screen.findByRole('link', { name, current: 'page' });
}

beforeEach(() => {
  act(() => {
    useTodoStore.setState({ todos: [] });
  });
});

describe('Список задач', () => {
  it('показывает пустое состояние', () => {
    setup();

    expect(screen.getByText('Задач пока нет')).toBeInTheDocument();
    expect(screen.getByText('Список пуст')).toBeInTheDocument();
  });

  it('добавляет задачу кнопкой и по Enter, очищая поле', async () => {
    const { user, input, addTodo } = setup();

    await addTodo('Купить молоко');
    await user.type(input, '  Позвонить маме  {Enter}');

    await expectTodoTitles(['Позвонить маме', 'Купить молоко']);
    expect(input).toHaveValue('');
    expect(screen.getByText('Осталось 2 задачи из 2')).toBeInTheDocument();
  });

  it('не добавляет пустую задачу и задачу из пробелов, показывает ошибку', async () => {
    const { user, input, addButton } = setup();

    await user.click(addButton);
    expect(screen.getByRole('alert')).toHaveTextContent('Введите текст задачи');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    await user.type(input, '    ');
    await user.click(addButton);

    await expectTodoTitles([]);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('скрывает ошибку, когда пользователь начинает печатать', async () => {
    const { user, input, addButton } = setup();

    await user.click(addButton);
    await user.type(input, 'З');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('переключает задачу между выполненной и невыполненной', async () => {
    const { user, addTodo } = setup();
    await addTodo('Сделать тестовое');

    const checkbox = screen.getByRole('checkbox', { name: 'Сделать тестовое' });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText('Все задачи выполнены')).toBeInTheDocument();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText('Осталась 1 задача из 1')).toBeInTheDocument();
  });

  it('удаляет задачу', async () => {
    const { user, addTodo } = setup();
    await addTodo('Оставить');
    await addTodo('Удалить');

    await user.click(screen.getByRole('button', { name: 'Удалить задачу «Удалить»' }));

    await expectTodoTitles(['Оставить']);
  });

  it('фильтрует задачи: все, активные, выполненные', async () => {
    const { user, addTodo } = setup();
    await addTodo('Активная');
    await addTodo('Выполненная');
    await user.click(screen.getByRole('checkbox', { name: 'Выполненная' }));

    await selectFilter(user, /Активные/);
    await expectTodoTitles(['Активная']);
    expect(window.location.search).toBe('?filter=active');

    await selectFilter(user, /Выполненные/);
    await expectTodoTitles(['Выполненная']);

    await selectFilter(user, /Все/);
    await expectTodoTitles(['Выполненная', 'Активная']);
  });

  it('фильтр «Все» убирает параметр, «Назад» возвращает прежний фильтр', async () => {
    const { user, addTodo } = setup();
    await addTodo('Задача');

    await selectFilter(user, /Активные/);
    await selectFilter(user, /Все/);
    expect(window.location.search).toBe('');

    act(() => {
      window.history.back();
    });

    await screen.findByRole('link', { name: /Активные/, current: 'page' });
    expect(window.location.search).toBe('?filter=active');
  });

  it('неизвестный фильтр в адресе считается «Все»', () => {
    window.history.replaceState(null, '', '/?filter=unknown');
    setup();

    expect(screen.getByRole('link', { name: /Все/, current: 'page' })).toBeInTheDocument();
  });

  it('показывает пустое состояние для фильтра без задач', async () => {
    const { user, addTodo } = setup();
    await addTodo('Активная');

    await selectFilter(user, /Выполненные/);

    await expectTodoTitles([]);
    expect(screen.getByText('Выполненных пока нет')).toBeInTheDocument();
  });

  it('берёт фильтр из адреса при открытии страницы', () => {
    window.history.replaceState(null, '', '/?filter=completed');
    setup();

    expect(screen.getByRole('link', { name: /Выполненные/, current: 'page' })).toBeInTheDocument();
  });

  it('очищает выполненные задачи', async () => {
    const { user, addTodo } = setup();
    const clearButton = screen.getByRole('button', { name: 'Очистить выполненные' });
    expect(clearButton).toBeDisabled();

    await addTodo('Активная');
    await addTodo('Выполненная');
    await user.click(screen.getByRole('checkbox', { name: 'Выполненная' }));
    await user.click(clearButton);

    await expectTodoTitles(['Активная']);
    expect(clearButton).toBeDisabled();
  });

  describe('редактирование', () => {
    it('сохраняет новое название по Enter', async () => {
      const { user, addTodo } = setup();
      await addTodo('Черновик');

      await user.click(screen.getByRole('button', { name: 'Редактировать задачу «Черновик»' }));
      const editor = screen.getByRole('textbox', { name: 'Новое название задачи «Черновик»' });
      expect(editor).toHaveFocus();
      await user.clear(editor);
      await user.type(editor, 'Чистовик{Enter}');

      await expectTodoTitles(['Чистовик']);
    });

    it('отменяет правку по Escape', async () => {
      const { user, addTodo } = setup();
      await addTodo('Исходное');

      await user.click(screen.getByRole('button', { name: 'Редактировать задачу «Исходное»' }));
      await user.type(screen.getByRole('textbox', { name: /Новое название/ }), ' изменено{Escape}');

      await expectTodoTitles(['Исходное']);
      expect(screen.queryByRole('textbox', { name: /Новое название/ })).not.toBeInTheDocument();
    });

    it('сохраняет при потере фокуса и не принимает пустое название', async () => {
      const { user, input, addTodo } = setup();
      await addTodo('Важное');

      await user.click(screen.getByRole('button', { name: 'Редактировать задачу «Важное»' }));
      await user.clear(screen.getByRole('textbox', { name: /Новое название/ }));
      await user.click(input);

      await expectTodoTitles(['Важное']);
    });
  });

  describe('редактирование описания', () => {
    async function openEditor(user: ReturnType<typeof userEvent.setup>, title: string) {
      await user.click(screen.getByRole('button', { name: `Редактировать задачу «${title}»` }));

      return {
        titleInput: screen.getByRole('textbox', { name: `Новое название задачи «${title}»` }),
        descriptionInput: screen.getByRole('textbox', { name: `Новое описание задачи «${title}»` }),
      };
    }

    it('добавляет описание существующей задаче', async () => {
      const { user, addTodo } = setup();
      await addTodo('Без описания');
      expect(screen.queryByRole('button', { name: /Описание задачи/ })).not.toBeInTheDocument();

      const { descriptionInput } = await openEditor(user, 'Без описания');
      expect(descriptionInput).toHaveValue('');
      await user.type(descriptionInput, 'Теперь с деталями');
      await user.click(screen.getByRole('button', { name: 'Сохранить' }));

      await user.click(screen.getByRole('button', { name: 'Описание задачи «Без описания»' }));
      expect(screen.getByText('Теперь с деталями')).toBeInTheDocument();
    });

    it('правит описание и сохраняет по Ctrl + Enter', async () => {
      const { user, input } = setup();
      await user.type(input, 'Задача');
      await user.click(screen.getByRole('button', { name: /добавить описание/i }));
      await user.type(
        screen.getByRole('textbox', { name: 'Описание задачи' }),
        'Старое{Control>}{Enter}{/Control}',
      );

      const { descriptionInput } = await openEditor(user, 'Задача');
      expect(descriptionInput).toHaveValue('Старое');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Новое{Control>}{Enter}{/Control}');

      expect(screen.queryByRole('textbox', { name: /Новое описание/ })).not.toBeInTheDocument();
      expect(useTodoStore.getState().todos[0]?.description).toBe('Новое');
    });

    it('переход между полями редактора его не закрывает', async () => {
      const { user, addTodo } = setup();
      await addTodo('Задача');

      const { titleInput, descriptionInput } = await openEditor(user, 'Задача');
      await user.click(descriptionInput);
      await user.click(titleInput);

      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveFocus();
    });

    it('«Отмена» отбрасывает изменения', async () => {
      const { user, addTodo } = setup();
      await addTodo('Задача');

      const { descriptionInput } = await openEditor(user, 'Задача');
      await user.type(descriptionInput, 'Не сохранится');
      await user.click(screen.getByRole('button', { name: 'Отмена' }));

      expect(screen.queryByRole('textbox', { name: /Новое описание/ })).not.toBeInTheDocument();
      expect(useTodoStore.getState().todos[0]?.description).toBe('');
    });

    it('при сохранении с пустым названием подсвечивает поле и не закрывается', async () => {
      const { user, addTodo } = setup();
      await addTodo('Задача');

      const { titleInput } = await openEditor(user, 'Задача');
      await user.clear(titleInput);
      await user.click(screen.getByRole('button', { name: 'Сохранить' }));

      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      expect(useTodoStore.getState().todos[0]?.title).toBe('Задача');
    });
  });

  describe('срок', () => {
    const addDeadlineName = /добавить срок/i;

    beforeEach(() => {
      // Подменяем только Date: настоящие таймеры нужны user-event
      vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 10, 1, 12) });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /** Кнопка быстрого выбора («Сегодня», «Завтра», «Очистить») или день по подписи */
    type DateChoice = string | RegExp;

    async function pickDate(user: ReturnType<typeof userEvent.setup>, choice: DateChoice) {
      const dialog = await screen.findByRole('dialog', { name: 'Выбор даты' });
      // Календарь грузится отдельным чанком — ждём его
      await within(dialog).findByRole('grid');
      await user.click(within(dialog).getByRole('button', { name: choice }));
    }

    async function addTodoWithDeadline(
      user: ReturnType<typeof userEvent.setup>,
      input: HTMLElement,
      title: string,
      choice: DateChoice,
    ) {
      await user.type(input, title);
      await user.click(screen.getByRole('button', { name: addDeadlineName }));
      await pickDate(user, choice);
      await user.click(screen.getByRole('button', { name: 'Добавить' }));
    }

    function getDeadlineBadge(title: string): HTMLElement {
      const card = screen.getByRole('checkbox', { name: title }).closest('li');

      return within(card!).getByText(/Срок:/).closest('time')!;
    }

    it('кнопка «Срок» появляется, только когда введён текст задачи', async () => {
      const { user, input } = setup();
      expect(screen.queryByRole('button', { name: addDeadlineName })).not.toBeInTheDocument();

      await user.type(input, 'З');

      expect(screen.getByRole('button', { name: addDeadlineName })).toBeInTheDocument();
    });

    it('добавляет задачу со сроком и выделяет близкий срок', async () => {
      const { user, input } = setup();
      await addTodoWithDeadline(user, input, 'Сдать отчёт', 'Завтра');
      await addTodoWithDeadline(user, input, 'Съездить в отпуск', /, 20 ноября/);

      const soon = getDeadlineBadge('Сдать отчёт');
      expect(soon).toHaveTextContent('Срок: завтра');
      expect(soon).toHaveAttribute('datetime', '2026-11-02');
      expect(soon.className).toMatch(/urgent/i);

      const later = getDeadlineBadge('Съездить в отпуск');
      expect(later).toHaveTextContent('Срок: 20 нояб.');
      expect(later.className).not.toMatch(/urgent/i);
    });

    it('показывает просрочку, у выполненной задачи срок не выделяет', async () => {
      const { user } = setup();
      act(() => {
        useTodoStore.getState().addTodo({ title: 'Просрочена', deadline: '2026-10-30' });
      });

      const badge = getDeadlineBadge('Просрочена');
      expect(badge).toHaveTextContent('просрочено на 2 дня');
      expect(badge.className).toMatch(/overdue/i);

      await user.click(screen.getByRole('checkbox', { name: 'Просрочена' }));
      expect(getDeadlineBadge('Просрочена').className).not.toMatch(/urgent/i);
    });

    it('«Убрать срок» — задача добавляется без срока', async () => {
      const { user, input, addButton } = setup();
      await user.type(input, 'Без срока');
      await user.click(screen.getByRole('button', { name: addDeadlineName }));
      await pickDate(user, /, 5 ноября/);
      expect(screen.getByRole('button', { name: /^Срок: 5 нояб\. 2026/ })).toHaveFocus();

      await user.click(screen.getByRole('button', { name: 'Убрать срок' }));
      await user.click(addButton);

      await expectTodoTitles(['Без срока']);
      expect(useTodoStore.getState().todos[0]?.deadline).toBeNull();
    });

    it('ставит и снимает срок в редакторе', async () => {
      const { user, addTodo } = setup();
      await addTodo('Задача');

      await user.click(screen.getByRole('button', { name: 'Редактировать задачу «Задача»' }));
      await user.click(screen.getByRole('button', { name: 'Срок задачи «Задача»: Без срока' }));
      await pickDate(user, 'Сегодня');
      // Выбор в календаре не закрывает редактор: фокус остаётся внутри формы
      await user.click(screen.getByRole('button', { name: 'Сохранить' }));
      expect(getDeadlineBadge('Задача')).toHaveTextContent('сегодня');

      await user.click(screen.getByRole('button', { name: 'Редактировать задачу «Задача»' }));
      await user.click(screen.getByRole('button', { name: /^Срок задачи «Задача»: 1 нояб/ }));
      await pickDate(user, 'Очистить');
      await user.click(screen.getByRole('button', { name: 'Сохранить' }));
      expect(useTodoStore.getState().todos[0]?.deadline).toBeNull();
    });

    it('в форме нельзя выбрать прошедший день, Escape закрывает календарь', async () => {
      const { user, input } = setup();
      await user.type(input, 'Задача');
      await user.click(screen.getByRole('button', { name: addDeadlineName }));

      const dialog = await screen.findByRole('dialog', { name: 'Выбор даты' });
      await within(dialog).findByRole('grid');
      expect(within(dialog).getByRole('button', { name: /, 31 октября/ })).toBeDisabled();
      expect(within(dialog).getByRole('button', { name: /, 2 ноября/ })).toBeEnabled();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Срок: Выбрать дату' })).toHaveFocus();
      // Escape закрыл только календарь, а не секцию срока
      expect(screen.getByRole('button', { name: 'Убрать срок' })).toBeInTheDocument();
    });

    it('в шапке — ссылка на ближайший срок, по клику список прокручивается к задаче', async () => {
      const { user } = setup();
      const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
      act(() => {
        const { addTodo } = useTodoStore.getState();
        addTodo({ title: 'Потом', deadline: '2026-11-20' });
        addTodo({ title: 'Скоро', deadline: '2026-11-02' });
        addTodo({ title: 'Уже сделано', deadline: '2026-10-01' });
      });
      act(() => {
        const done = useTodoStore.getState().todos.find((todo) => todo.title === 'Уже сделано');
        useTodoStore.getState().toggleTodo(done!.id);
      });

      const header = screen.getByRole('banner');
      expect(header).toHaveTextContent('Ближайший срок — «Скоро», завтра');

      await selectFilter(user, /Выполненные/);
      await user.click(within(header).getByRole('link', { name: 'Скоро' }));

      await screen.findByRole('link', { name: /Все/, current: 'page' });
      const card = await screen.findByRole('checkbox', { name: 'Скоро' });
      const item = card.closest('li')!;
      await waitFor(() => {
        expect(item).toHaveAttribute('data-highlighted', 'true');
      });
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    });
  });

  describe('описание', () => {
    const addDescriptionName = /добавить описание/i;

    it('кнопка «Описание» появляется, только когда введён текст задачи', async () => {
      const { user, input } = setup();
      expect(screen.queryByRole('button', { name: addDescriptionName })).not.toBeInTheDocument();

      await user.type(input, '   ');
      expect(screen.queryByRole('button', { name: addDescriptionName })).not.toBeInTheDocument();

      await user.type(input, 'З');
      expect(screen.getByRole('button', { name: addDescriptionName })).toBeInTheDocument();
    });

    it('добавляет задачу с описанием и разворачивает его', async () => {
      const { user, input, addButton } = setup();
      await user.type(input, 'Купить продукты');
      await user.click(screen.getByRole('button', { name: addDescriptionName }));

      const textarea = screen.getByRole('textbox', { name: 'Описание задачи' });
      expect(textarea).toHaveFocus();
      await user.type(textarea, 'Молоко{Shift>}{Enter}{/Shift}Хлеб');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: 'Описание задачи' })).not.toBeInTheDocument();
      });
      const toggle = screen.getByRole('button', { name: 'Описание задачи «Купить продукты»' });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText(/Молоко/)).not.toBeInTheDocument();

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText(/Молоко\s+Хлеб/)).toBeInTheDocument();

      await user.click(toggle);
      await waitFor(() => {
        expect(screen.queryByText(/Молоко/)).not.toBeInTheDocument();
      });
    });

    it('отправляет форму по Ctrl + Enter из описания и возвращает фокус в поле задачи', async () => {
      const { user, input } = setup();
      await user.type(input, 'Задача');
      await user.click(screen.getByRole('button', { name: addDescriptionName }));
      await user.type(screen.getByRole('textbox', { name: 'Описание задачи' }), 'Детали');

      await user.keyboard('{Control>}{Enter}{/Control}');

      await expectTodoTitles(['Задача']);
      expect(input).toHaveValue('');
      expect(input).toHaveFocus();
      expect(useTodoStore.getState().todos[0]?.description).toBe('Детали');
    });

    it('«Убрать описание» стирает его, задача добавляется без описания', async () => {
      const { user, input, addButton } = setup();
      await user.type(input, 'Без деталей');
      await user.click(screen.getByRole('button', { name: addDescriptionName }));
      await user.type(screen.getByRole('textbox', { name: 'Описание задачи' }), 'Лишнее');

      await user.click(screen.getByRole('button', { name: 'Убрать описание' }));
      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: 'Описание задачи' })).not.toBeInTheDocument();
      });
      expect(input).toHaveFocus();
      await user.click(addButton);

      await expectTodoTitles(['Без деталей']);
      expect(screen.queryByRole('button', { name: /Описание задачи/ })).not.toBeInTheDocument();
    });
  });

  it('в подвале ссылки на GitHub и резюме открываются в новой вкладке', () => {
    setup();
    const footer = screen.getByRole('contentinfo');

    expect(footer).toHaveTextContent('Михаил Кривошеев');
    for (const name of [/GitHub/, /Резюме/]) {
      const link = within(footer).getByRole('link', { name });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(within(footer).getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/MikhailKrivosheev',
    );
  });

  it('переключает тему кнопкой в шапке и запоминает выбор', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Включить тёмную тему' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('zaloghub-theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Включить светлую тему' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(screen.getByRole('button', { name: 'Включить тёмную тему' })).toBeInTheDocument();
  });

  it('сохраняет задачи в localStorage', async () => {
    const { user, addTodo } = setup();
    await addTodo('Не потеряться');
    await user.click(screen.getByRole('checkbox', { name: 'Не потеряться' }));

    const stored: unknown = JSON.parse(localStorage.getItem('zaloghub-todos') ?? 'null');

    expect(stored).toMatchObject({
      state: { todos: [{ title: 'Не потеряться', completed: true }] },
    });
  });
});
