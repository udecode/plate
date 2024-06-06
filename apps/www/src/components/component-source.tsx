'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';

import { CodeBlockWrapper } from './code-block-wrapper';

interface ComponentSourceProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  name?: string;
  open?: boolean;
}

export function ComponentSource({
  children,
  className,
  name,
  ...props
}: ComponentSourceProps) {
  return (
    <CodeBlockWrapper
      className={cn('my-6 overflow-hidden rounded-md', className)}
      expandButtonTitle={name || 'Expand'}
      {...props}
    >
      {children}
    </CodeBlockWrapper>
  );
}
