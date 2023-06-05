import React from 'react';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

export function CodeLeaf({ className, children, ...props }: PlateLeafProps) {
  return (
    <PlateLeaf
      asChild
      className={cn(
        'whitespace-pre-wrap',
        "rounded-[3px] bg-[rgba(135,131,120,0.15)] px-[0.4em] py-[0.2em] font-['SFMono-Regular',_Consolas,_'Liberation_Mono',_Menlo,_Courier,_monospace] text-[85%] leading-[normal]",
        className
      )}
      {...props}
    >
      <code>{children}</code>
    </PlateLeaf>
  );
}
