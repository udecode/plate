import React from 'react';

import { withVariants } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

export const inputVariants = cva(
  'flex w-full rounded-md bg-transparent text-base file:border-0 file:bg-background file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    defaultVariants: {
      h: 'md',
      variant: 'default',
    },
    variants: {
      h: {
        md: 'h-10 px-3 py-2',
        sm: 'h-[28px] px-1.5 py-1',
      },
      variant: {
        default:
          'border border-input ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        ghost: 'border-none focus-visible:ring-transparent',
      },
    },
  }
);

export type InputProps = React.ComponentPropsWithoutRef<'input'> &
  VariantProps<typeof inputVariants>;

export const Input = withVariants('input', inputVariants, ['variant', 'h']);

export type FloatingInputProps = InputProps & {
  label: string;
};

export function FloatingInput({
  id,
  className,
  label,
  ...props
}: FloatingInputProps) {
  return (
    <>
      <label
        className="absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground"
        htmlFor={id}
      >
        <span className="inline-flex bg-background px-2">{label}</span>
      </label>
      <Input id={id} className={className} placeholder="" {...props} />
    </>
  );
}
