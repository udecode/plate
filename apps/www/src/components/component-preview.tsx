import * as React from 'react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function ComponentPreview({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('group relative my-4 flex flex-col', className)}
      {...props}
    >
      <div className="rounded-md border">{children}</div>
    </div>
  );
}
