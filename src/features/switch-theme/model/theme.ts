import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

/** Выбор пользователя: тема или `system` — как в настройках системы. */
export type ThemePreference = Theme | 'system';

// Этот же ключ читает скрипт в index.html, чтобы поставить тему до первой отрисовки
export const THEME_STORAGE_KEY = 'zaloghub-theme';

const THEME_CHANGE_EVENT = 'zaloghub-theme-change';
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// Цвет строки браузера на мобильных — как --color-page в tokens.scss
const THEME_COLORS: Record<Theme, string> = { light: '#f4f5fb', dark: '#111218' };

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function getSystemTheme(): Theme {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
}

/**
 * @returns сохранённый выбор темы; `system`, если ничего не выбрано или storage недоступен
 */
export function readThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);

    return isTheme(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

/**
 * @param preference выбор пользователя
 * @returns тема, которая сейчас показана
 */
export function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? getSystemTheme() : preference;
}

/**
 * Ставит тему на страницу: атрибут data-theme на <html> и цвет строки браузера.
 *
 * @param preference выбор пользователя
 */
export function applyTheme(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === 'system') {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = preference;
  }

  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    // У тегов в index.html свои media: при системной теме браузер сам выбирает подходящий
    const metaTheme: Theme = meta.media.includes('dark') ? 'dark' : 'light';
    meta.content = THEME_COLORS[preference === 'system' ? metaTheme : preference];
  }
}

/**
 * Запоминает выбор, применяет его и сообщает подписчикам.
 *
 * @param preference новая тема или `system`
 */
export function setThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Storage недоступен (приватный режим) — тема работает до перезагрузки
  }
  applyTheme(preference);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function subscribeToTheme(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_SCHEME_QUERY);
  function handleStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      applyTheme(readThemePreference());
      onChange();
    }
  }

  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener('storage', handleStorage);
  media.addEventListener('change', onChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', handleStorage);
    media.removeEventListener('change', onChange);
  };
}

/**
 * @returns показанная тема; обновляется при переключении, смене системной темы и в других вкладках
 */
export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribeToTheme,
    () => resolveTheme(readThemePreference()),
    () => 'light',
  );
}
