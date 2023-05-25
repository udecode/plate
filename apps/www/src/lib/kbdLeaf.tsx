import React from 'react';
import { cn, PlateLeaf, PlateLeafProps } from '@udecode/plate-tailwind';

export function KbdLeaf({ className, ...props }: PlateLeafProps) {
  return (
    <PlateLeaf
      as="kbd"
      className={cn(
        'whitespace-pre-wrap border border-black bg-background',
        'mr-[0.2em] rounded-[3px] px-[0.4em] py-[0.2em] text-[75%] leading-[normal] shadow-[2px_2px_3px_0_rgba(0,_0,_0.75)]',
        "font-['SFMono-Regular',_Consolas,_'Liberation_Mono',_Menlo,_Courier,_monospace]",
        className
      )}
      {...props}
    />
  );
}
