'use client';

import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common/react';
import Link from 'next/link';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

export const TagElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { element } = props;
    const selected = useSelected();
    const focused = useFocused();
    const readOnly = useReadOnly();

    console.log(element);

    const badge = (
      <div
        className={cn(
          'shrink-0 break-normal rounded-full border px-2.5 align-middle text-sm font-semibold transition-colors focus:outline-none',
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/60',
          selected && focused && 'ring-2 ring-ring ring-offset-0',
          'flex items-center gap-1.5'
        )}
      >
        {element.value as string}
      </div>
    );

    const content =
      readOnly && element.url ? (
        <Link href={element.url as string}>{badge}</Link>
      ) : (
        badge
      );

    return (
      <PlateElement
        ref={ref}
        className={cn(
          'm-0.5 inline-flex cursor-pointer select-none',
          className
        )}
        {...props}
      >
        {content}
        {children}
      </PlateElement>
    );
  }
);
