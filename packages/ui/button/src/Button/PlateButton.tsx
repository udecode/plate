import React from 'react';
import { cn, cva, VariantProps } from '@udecode/plate-styled-components';

export const buttonVariants = cva(
  cn(
    'relative box-border inline-flex max-w-full cursor-pointer items-center justify-center space-x-2 border-0 bg-white p-0 px-2.5 text-center font-medium',
    'min-h-[28px] min-w-[28px] rounded-[3px] font-[inherit] text-[14px] text-inherit',
    'visited:text-inherit hover:bg-gray-100 focus:!outline-none active:bg-gray-200 active:text-inherit',
    '[&_svg]:h-4 [&_svg]:w-4'
  ),
  {
    variants: {
      variant: {
        primary:
          'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 active:text-white',
        menu: 'w-full justify-start',
      },
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        type="button"
        className={buttonVariants({ variant, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
