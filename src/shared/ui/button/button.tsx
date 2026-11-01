import cn from 'classnames';

import type { ButtonProps } from './types';

import styles from './button.module.scss';

function Button({
  variant = 'primary',
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  const buttonClasses = cn(styles.button, styles[variant], className);

  return (
    <button {...props} type={type} className={buttonClasses}>
      {children}
    </button>
  );
}

export default Button;
