/* eslint-disable jsx-a11y/interactive-supports-focus */
'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Button } from '@/registry/default/plate-ui/button';

import { CodeBlockWrapper } from './code-block-wrapper';

interface ComponentSourceProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  name?: string;
  open?: boolean;
  title?: string;
}

export function ComponentSource({
  children,
  className,
  name,
  title,
  ...props
}: ComponentSourceProps) {
  const displaySrc = title ?? props.src?.split('/').pop() ?? name + '.tsx';
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <div className="mb-6 mt-4">
      {displaySrc && (
        <Button
          size="none"
          variant="ghost"
          className="mb-0.5 w-fit select-auto px-4 py-1 text-sm font-medium text-foreground"
          onClick={() => {
            copyToClipboard(displaySrc, {
              tooltip: 'Copied to clipboard',
            });
          }}
        >
          {displaySrc}
        </Button>
      )}

      <CodeBlockWrapper
        className={cn('overflow-hidden rounded-md', className)}
        expandButtonTitle="Expand"
        {...props}
      >
        {children}
      </CodeBlockWrapper>
    </div>
  );
}
