'use client';

import { AIChatPlugin } from '@udecode/plate-ai/react';
import { type PlateTextProps, PlateText } from '@udecode/plate/react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const aiIndicatorVariants = cva(
  'after:ml-1.5 after:inline-block after:h-3 after:w-3 after:animate-pulse after:rounded-full after:bg-primary after:align-middle after:content-[""]'
);

export function AILeaf(props: PlateTextProps) {
  const streamingLeaf = props.editor
    .getApi(AIChatPlugin)
    .aiChat.node({ streaming: true });

  const isLast = streamingLeaf?.[0] === props.text;

  return (
    <PlateText
      className={cn(
        'border-b-2 border-b-purple-100 bg-purple-50 text-purple-800',
        'transition-all duration-200 ease-in-out',
        isLast && aiIndicatorVariants()
      )}
      {...props}
    />
  );
}
