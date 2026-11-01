import { afterEach, describe, expect, it } from 'vitest';

import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  setThemePreference,
  THEME_STORAGE_KEY,
} from './theme';

function addThemeColorMeta(media: string): HTMLMetaElement {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.media = media;
  document.head.append(meta);

  return meta;
}

afterEach(() => {
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.remove();
  });
});

describe('тема', () => {
  it('без выбора — системная, мусор в storage тоже считается системной', () => {
    expect(readThemePreference()).toBe('system');

    localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(readThemePreference()).toBe('system');
  });

  it('системная тема берётся из prefers-color-scheme', () => {
    expect(resolveTheme('system')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('выбор сохраняется и ставит data-theme, «системная» — убирает', () => {
    setThemePreference('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    setThemePreference('system');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('цвет строки браузера следует выбранной теме', () => {
    const lightMeta = addThemeColorMeta('(prefers-color-scheme: light)');
    const darkMeta = addThemeColorMeta('(prefers-color-scheme: dark)');

    applyTheme('dark');
    expect([lightMeta.content, darkMeta.content]).toEqual(['#111218', '#111218']);

    applyTheme('system');
    expect([lightMeta.content, darkMeta.content]).toEqual(['#f4f5fb', '#111218']);
  });
});
