'use client';

import * as React from 'react';
import { Button } from './ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

import { cn } from '@/lib/utils';

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  expandButtonTitle?: string;
  open?: boolean;
}

export function CodeBlockWrapper({
  expandButtonTitle = 'View Code',
  className,
  children,
  open = false,
  ...props
}: CodeBlockProps) {
  const [isOpened, setIsOpened] = React.useState(open);

  return (
    <Collapsible open={isOpened} onOpenChange={setIsOpened}>
      <div className={cn('relative overflow-hidden', className)} {...props}>
        <CollapsibleContent
          forceMount
          className={cn('overflow-hidden', !isOpened && 'max-h-32')}
        >
          <div
            className={cn(
              '[&_pre]:my-0 [&_pre]:max-h-[650px] [&_pre]:pb-[100px]',
              !isOpened ? '[&_pre]:overflow-hidden' : '[&_pre]:overflow-auto]'
            )}
          >
            {children}
          </div>
        </CollapsibleContent>
        <div
          className={cn(
            'absolute flex items-center justify-center bg-gradient-to-b from-background/30 to-muted/90 p-2',
            isOpened ? 'inset-x-0 bottom-0 h-12' : 'inset-0'
          )}
        >
          <CollapsibleTrigger asChild>
            <Button variant="secondary" className="h-8 text-xs">
              {isOpened ? 'Collapse' : expandButtonTitle}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
    </Collapsible>
  );
}
