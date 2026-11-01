import cn from 'classnames';
import { m } from 'framer-motion';

import type { CheckboxProps } from './types';

import styles from './checkbox.module.scss';

function Checkbox({ checked, label, className, ...props }: CheckboxProps) {
  const checkboxClasses = cn(styles.checkbox, checked && styles.checkboxChecked, className);

  return (
    <span className={checkboxClasses}>
      <input
        {...props}
        type="checkbox"
        className={styles.input}
        checked={checked}
        aria-label={label}
      />
      <svg className={styles.mark} viewBox="0 0 16 16" aria-hidden="true">
        <m.path
          d="M3.5 8.5 6.5 11.5 12.5 4.75"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </svg>
    </span>
  );
}

export default Checkbox;
