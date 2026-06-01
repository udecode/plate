'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Separator } from './ui/separator';

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  expandButtonTitle?: string;
  full?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export function CodeBlockWrapper({
  children,
  className,
  expandButtonTitle = 'Expand',
  full = false,
  onOpenChange,
  open = false,
  ...props
}: CodeBlockProps) {
  const [internalOpen, setInternalOpen] = React.useState<boolean | null>(null);
  const isOpened = internalOpen ?? open;
  const triggerTitle = isOpened ? 'Collapse' : expandButtonTitle;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange]
  );

  if (full) {
    return (
      <div className={cn('md:-mx-1 relative', className)} {...props}>
        <div className="[&>figure]:mt-0 [&>figure]:md:mx-0! [&>pre]:my-0 [&_pre]:my-0">
          {children}
        </div>
      </div>
    );
  }

  return (
    <Collapsible
      open={isOpened}
      onOpenChange={handleOpenChange}
      className={cn('group/collapsible md:-mx-1 relative', className)}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <div className="absolute top-1.5 right-9 z-10 flex items-center">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-md px-2 text-muted-foreground"
          >
            {triggerTitle}
          </Button>
          <Separator orientation="vertical" className="mx-1.5 h-4!" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent
        forceMount
        className={cn(
          'relative mt-6 overflow-hidden data-[state=closed]:max-h-64 data-[state=closed]:[content-visibility:auto]',
          '[&>figure]:mt-0 [&>figure]:md:mx-0! [&>pre]:my-0 [&_pre]:my-0'
        )}
      >
        {children}
      </CollapsibleContent>
      <CollapsibleTrigger
        className={cn(
          '-bottom-2 absolute inset-x-0 flex h-20 items-center justify-center rounded-b-lg bg-gradient-to-b from-code/70 to-code text-muted-foreground text-sm',
          'group-data-[state=open]/collapsible:hidden'
        )}
      >
        {expandButtonTitle}
      </CollapsibleTrigger>
    </Collapsible>
  );
}
