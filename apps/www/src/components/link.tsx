import * as React from 'react';

import { cn } from '@udecode/cn';
import LinkPrimitive from 'next/link';

export function Link({
  className,
  ...props
}: React.ComponentProps<typeof LinkPrimitive>) {
  return (
    <LinkPrimitive
      className={cn('font-medium underline underline-offset-4', className)}
      {...props}
    />
  );
}
