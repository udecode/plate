'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CodeCollapsiblePre({
  children,
  className,
  ...props
}: React.ComponentProps<'pre'>) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);

  return (
    <pre
      id={id}
      data-state={open ? 'open' : 'closed'}
      className={cn(
        className,
        'relative data-[state=closed]:max-h-64 data-[state=closed]:overflow-y-hidden'
      )}
      {...props}
    >
      <span aria-hidden className="float-right h-6 w-20" />
      {children}
      <Button
        aria-controls={id}
        aria-expanded={open}
        className="absolute top-3 right-10 h-7 rounded-md px-2 text-muted-foreground"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Collapse' : 'Expand'}
      </Button>
      {!open && (
        <button
          aria-hidden
          className="absolute inset-x-0 bottom-0 flex h-20 items-center justify-center bg-gradient-to-b from-code/70 to-code text-sm text-muted-foreground"
          tabIndex={-1}
          type="button"
          onClick={() => setOpen(true)}
        >
          Expand
        </button>
      )}
    </pre>
  );
}
