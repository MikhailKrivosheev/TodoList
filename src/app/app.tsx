import { useEffect } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';

import { TodoPage } from '@/pages/todo-page';
import { applyTheme, readThemePreference } from '@/features/switch-theme';
import { subscribeToTodoStorage } from '@/entities/todo';
import { preloadCalendar } from '@/shared/ui/date-picker';

const loadMotionFeatures = () => import('./motion-features').then((module) => module.default);

const IDLE_PRELOAD_TIMEOUT_MS = 2000;

function preloadWhenIdle(): () => void {
  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(preloadCalendar, {
      timeout: IDLE_PRELOAD_TIMEOUT_MS,
    });

    return () => {
      window.cancelIdleCallback(handle);
    };
  }
  const timer = setTimeout(preloadCalendar, IDLE_PRELOAD_TIMEOUT_MS);

  return () => {
    clearTimeout(timer);
  };
}

function App() {
  useEffect(subscribeToTodoStorage, []);
  useEffect(preloadWhenIdle, []);
  useEffect(() => {
    applyTheme(readThemePreference());
  }, []);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <TodoPage />
      </MotionConfig>
    </LazyMotion>
  );
}

export default App;
