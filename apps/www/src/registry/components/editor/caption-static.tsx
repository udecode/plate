import { cn } from 'cn';
import { type Element, NodeApi } from 'platejs';
import * as React from 'react';

export const getMediaTextAlign = (element: object) => {
  if (!('textAlign' in element)) return 'center';

  switch (element.textAlign) {
    case 'end':
    case 'left':
    case 'right': {
      return element.textAlign;
    }
    case 'justify':
    case 'start': {
      return 'start';
    }
    default: {
      return 'center';
    }
  }
};

export function CaptionStatic({
  align = 'center',
  children,
  className,
  element,
  ...props
}: React.ComponentProps<'figcaption'> & {
  align?: ReturnType<typeof getMediaTextAlign>;
  element: Element;
}) {
  if (NodeApi.string(element).length === 0) return null;

  return (
    <figcaption
      {...props}
      className={cn(
        'mt-2 min-h-6 max-w-full',
        align === 'center' && 'mx-auto text-center',
        align === 'start' && 'me-auto text-start',
        align === 'end' && 'ms-auto text-end',
        align === 'left' && '[margin-right:auto] [text-align:left]',
        align === 'right' && '[margin-left:auto] [text-align:right]',
        className
      )}
    >
      {children}
    </figcaption>
  );
}
