import { ButtonHTMLAttributes } from 'react';

const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-deep shadow-sm disabled:opacity-50',
  secondary:
    'bg-white text-ink-900 border border-ink-100 hover:bg-sand-50 disabled:opacity-50',
  ghost: 'text-ink-700 hover:bg-ink-100/60 disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
} as const;

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
} as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
