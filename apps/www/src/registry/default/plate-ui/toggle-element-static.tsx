import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';
import { ChevronRight } from 'lucide-react';

export function ToggleElementStatic({
  children,
  className,
  element,
  ...props
}: PlateElementStaticProps) {
  return (
    <PlateElementStatic
      className={cn('relative pl-6', className)}
      element={element}
      {...props}
    >
      <div
        className="absolute -left-0.5 top-0 size-6 cursor-pointer select-none items-center justify-center rounded-md p-px text-muted-foreground transition-colors hover:bg-accent [&_svg]:size-4"
        contentEditable={false}
      >
        <ChevronRight
          className={cn('transition-transform duration-75', 'rotate-0')}
        />
      </div>
      {children}
    </PlateElementStatic>
  );
}
