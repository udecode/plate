import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export function DateElementStatic({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  return (
    <PlateStaticElement
      className={cn('inline-block', className)}
      element={element}
      {...props}
    >
      <span
        className={cn('w-fit rounded-sm bg-muted px-1 text-muted-foreground')}
      >
        {element.date ? (
          (() => {
            const today = new Date();
            const elementDate = new Date(element.date as string);
            const isToday =
              elementDate.getDate() === today.getDate() &&
              elementDate.getMonth() === today.getMonth() &&
              elementDate.getFullYear() === today.getFullYear();

            const isYesterday =
              new Date(today.setDate(today.getDate() - 1)).toDateString() ===
              elementDate.toDateString();
            const isTomorrow =
              new Date(today.setDate(today.getDate() + 2)).toDateString() ===
              elementDate.toDateString();

            if (isToday) return 'Today';
            if (isYesterday) return 'Yesterday';
            if (isTomorrow) return 'Tomorrow';

            return elementDate.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          })()
        ) : (
          <span>Pick a date</span>
        )}
      </span>
      {children}
    </PlateStaticElement>
  );
}
