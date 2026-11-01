import cn from 'classnames';

import type { IconButtonProps } from './types';

import styles from './icon-button.module.scss';

function IconButton({ label, icon, tone = 'neutral', className, ...props }: IconButtonProps) {
  const buttonClasses = cn(styles.button, styles[tone], className);

  return (
    <button {...props} type="button" className={buttonClasses} aria-label={label} title={label}>
      {icon}
    </button>
  );
}

export default IconButton;
