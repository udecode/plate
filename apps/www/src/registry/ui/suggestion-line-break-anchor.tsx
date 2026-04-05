'use client';

import * as React from 'react';

import { CornerDownLeftIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function SuggestionLineBreakAnchor({
  badgeProps,
  children,
  className,
}: {
  badgeProps?: React.ComponentProps<'span'>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="inline-flex max-w-full items-center align-top">
      {children}
      <span
        {...badgeProps}
        className={cn(
          'inline-flex h-[calc(1lh+2px)] w-[1lh] shrink-0 items-center justify-center leading-none',
          badgeProps?.className,
          className
        )}
        contentEditable={false}
      >
        <CornerDownLeftIcon className="-top-px relative size-4" />
      </span>
    </div>
  );
}
