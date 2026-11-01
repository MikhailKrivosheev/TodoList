import { useSyncExternalStore } from 'react';

import { toDateKey, type DateKey } from './date';

function getToday(): DateKey {
  return toDateKey(new Date());
}

function subscribeToDayChange(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;

  function scheduleMidnight() {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(() => {
      onChange();
      scheduleMidnight();
    }, nextMidnight.getTime() - now.getTime());
  }

  scheduleMidnight();
  document.addEventListener('visibilitychange', onChange);

  return () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', onChange);
  };
}

/**
 * @returns сегодняшняя дата `YYYY-MM-DD`; компонент перерисуется, когда наступит новый день
 */
export function useToday(): DateKey {
  return useSyncExternalStore(subscribeToDayChange, getToday);
}
