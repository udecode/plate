import { withVariants } from '@udecode/cn';
import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'file:bg-background file:text-foreground placeholder:text-muted-foreground flex w-full rounded-md bg-transparent text-sm file:border-0 file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
          'border-input ring-offset-background focus-visible:ring-ring border focus-visible:ring-2 focus-visible:ring-offset-2',
        ghost: 'border-none focus-visible:ring-transparent',
      },
    },
  }
);

export const Input = withVariants('input', inputVariants, ['variant', 'h']);
