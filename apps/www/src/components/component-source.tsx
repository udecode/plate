'use client';

import * as React from 'react';
import { CodeBlockWrapper } from './code-block-wrapper';

import { cn } from '@/lib/utils';

interface ComponentSourceProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  open?: boolean;
  name?: string;
}

export function ComponentSource({
  children,
  open,
  name,
  className,
}: ComponentSourceProps) {
  return (
    <CodeBlockWrapper
      expandButtonTitle={name || 'Expand'}
      className={cn('my-6 overflow-hidden rounded-md', className)}
      open={open}
    >
      {children}
    </CodeBlockWrapper>
  );
}
