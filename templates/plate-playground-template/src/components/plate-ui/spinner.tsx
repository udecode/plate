import React from 'react';

import { cn } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';
import { type LucideProps, Loader2Icon } from 'lucide-react';

const spinnerVariants = cva('text-muted-foreground animate-spin', {
  defaultVariants: {
    size: 'default',
  },
  variants: {
    size: {
      default: 'size-4',
      icon: 'size-10',
      lg: 'size-6',
      sm: 'size-2',
    },
  },
});

export const Spinner = ({
  className,
  size,
  ...props
}: Partial<LucideProps & VariantProps<typeof spinnerVariants>>) => (
  <Loader2Icon
    className={cn(spinnerVariants({ size }), className)}
    {...props}
  />
);
