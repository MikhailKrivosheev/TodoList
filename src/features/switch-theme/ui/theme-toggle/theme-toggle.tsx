import { AnimatePresence, m } from 'framer-motion';

import IconButton from '@/shared/ui/icon-button';
import MoonIcon from '@/shared/ui/icons/moon-icon';
import SunIcon from '@/shared/ui/icons/sun-icon';

import { setThemePreference, useTheme } from '../../model/theme';

import styles from './theme-toggle.module.scss';

function ThemeToggle() {
  const theme = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <IconButton
      className={styles.toggle}
      label={nextTheme === 'dark' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      icon={
        <AnimatePresence initial={false} mode="wait">
          <m.span
            key={theme}
            className={styles.icon}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
          </m.span>
        </AnimatePresence>
      }
      onClick={() => {
        setThemePreference(nextTheme);
      }}
    />
  );
}

export default ThemeToggle;
