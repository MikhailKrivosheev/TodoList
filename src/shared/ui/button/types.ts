import type { ComponentPropsWithRef } from 'react';

export type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'danger';

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
};
