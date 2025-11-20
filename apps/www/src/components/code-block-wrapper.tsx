'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  expandButtonTitle?: string;
  full?: boolean;
  open?: boolean;
}

export function CodeBlockWrapper({
  children,
  className,
  expandButtonTitle = 'Expand',
  full = false,
  open = false,
  ...props
}: CodeBlockProps) {
  const [isOpened, setIsOpened] = React.useState(open);

  if (full) {
    return (
      <div className={cn('relative overflow-hidden', className)} {...props}>
        <div className="[&_pre]:my-0">{children}</div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpened} onOpenChange={setIsOpened}>
      <div className={cn('relative overflow-hidden', className)} {...props}>
        <CollapsibleContent
          className={cn('overflow-hidden', !isOpened && 'max-h-72')}
          forceMount
        >
          <div
            className={cn(
              '[&_pre]:my-0 [&_pre]:max-h-[650px] [&_pre]:pb-[100px]',
              isOpened ? '[&_pre]:overflow-auto]' : '[&_pre]:overflow-hidden'
            )}
          >
            {children}
          </div>
        </CollapsibleContent>
        <div
          className={cn(
            'absolute flex items-center justify-center bg-linear-to-b from-background/10 to-90% to-background px-2 py-1',
            isOpened ? 'inset-x-0 bottom-0 h-12 from-gray-900/30' : 'inset-0'
          )}
        >
          <CollapsibleTrigger asChild>
            <Button variant="secondary" className="mb-8 h-8 text-xs">
              {isOpened ? 'Collapse' : expandButtonTitle}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
    </Collapsible>
  );
}
