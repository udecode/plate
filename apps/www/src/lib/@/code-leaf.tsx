import React from 'react';
import { cn, PlateLeaf, PlateLeafProps } from '@udecode/plate-tailwind';

export function CodeLeaf({ className, ...props }: PlateLeafProps) {
  return (
    <PlateLeaf
      as="code"
      className={cn(
        'whitespace-pre-wrap',
        "rounded-[3px] bg-[rgba(135,131,120,0.15)] px-[0.4em] py-[0.2em] font-['SFMono-Regular',_Consolas,_'Liberation_Mono',_Menlo,_Courier,_monospace] text-[85%] leading-[normal]",
        className
      )}
      {...props}
    />
  );
}
