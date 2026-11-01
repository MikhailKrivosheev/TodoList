import type { KeyboardEvent } from 'react';

/**
 * В многострочном поле Enter — перенос строки, поэтому форму отправляет Ctrl + Enter
 * (⌘ + Enter на macOS).
 *
 * @param event нажатие клавиши в textarea внутри формы
 */
export function submitFormOnModEnter(event: KeyboardEvent<HTMLTextAreaElement>): void {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}
