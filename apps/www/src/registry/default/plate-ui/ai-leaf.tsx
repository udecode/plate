'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import { PlateText } from '@udecode/plate/react';
import { cva } from 'class-variance-authority';

const aiIndicatorVariants = cva(
  'after:ml-1.5 after:inline-block after:h-3 after:w-3 after:animate-pulse after:rounded-full after:bg-primary after:align-middle after:content-[""]'
);

export function AILeaf({
  className,
  ...props
}: React.ComponentProps<typeof PlateText>) {
  const streamingLeaf = props.editor
    .getApi(AIChatPlugin)
    .aiChat.node({ streaming: true });

  const isLast = streamingLeaf?.[0] === props.text;

  return (
    <PlateText
      className={cn(
        className,
        'border-b-2 border-b-purple-100 bg-purple-50 text-purple-800',
        'transition-all duration-200 ease-in-out',
        isLast && aiIndicatorVariants()
      )}
      {...props}
    />
  );
}
