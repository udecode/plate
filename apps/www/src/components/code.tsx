import React from 'react';

import { cn } from '@udecode/cn';

export function Code({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        'relative rounded px-[0.3rem] py-[0.2rem] font-mono',
        className
      )}
      {...props}
    />
  );
}
