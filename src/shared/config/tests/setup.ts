import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { afterEach, vi } from 'vitest';

MotionGlobalConfig.skipAnimations = true;

Element.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement) {
  this.style.display = 'block';
};
HTMLElement.prototype.hidePopover = function hidePopover(this: HTMLElement) {
  this.style.display = '';
};
window.ResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};
window.matchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  window.history.replaceState(null, '', '/');
});
