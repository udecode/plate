import * as React from 'react';

import type { Element, TResizableProps } from 'platejs';

import { NodeApi } from 'platejs';

import { cn } from '@/lib/utils';

export function CaptionStatic({
  align = 'center',
  children,
  className,
  element,
  ...props
}: React.ComponentProps<'figcaption'> & {
  align?: TResizableProps['align'];
  element: Element;
}) {
  if (NodeApi.string(element).length === 0) return null;

  return (
    <figcaption
      {...props}
      className={cn(
        'mt-2 min-h-6 max-w-full',
        align === 'center' && 'mx-auto text-center',
        align === 'left' && 'mr-auto text-left',
        align === 'right' && 'ml-auto text-right',
        className
      )}
    >
      {children}
    </figcaption>
  );
}
