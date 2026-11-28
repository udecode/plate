import React from 'react';

import { cn } from '@/lib/utils';

export function Code({
  __html__,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  __html__?: string;
}) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[max(87.5%,.875rem)] [overflow-wrap:anywhere]',
        className
      )}
      {...props}
      {...(__html__ !== undefined
        ? { dangerouslySetInnerHTML: { __html: __html__ } }
        : { children })}
    />
  );
}
