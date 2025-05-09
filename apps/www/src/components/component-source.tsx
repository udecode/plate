'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';

import { CodeBlockWrapper } from './code-block-wrapper';

interface ComponentSourceProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  open?: boolean;
  src?: string;
  title?: string;
}

export function ComponentSource({
  children,
  className,
  name,
  src,
  title,
  ...props
}: ComponentSourceProps) {
  const displaySrc = title ?? src?.split('/').pop() ?? name + '.tsx';
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <div className="mt-4 mb-6">
      {displaySrc && (
        <Button
          size="sm"
          variant="ghost"
          className="mb-0.5 w-fit px-4 py-1 text-sm font-medium text-foreground select-auto"
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
