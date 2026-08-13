'use client';

import { AIChatPlugin, type AIPlugin } from '@platejs/ai/react';
import {
  type PlateElementProps,
  type PlateTextProps,
  PlateElement,
  PlateText,
  usePluginStore,
} from 'platejs/react';

import { cn } from '@/lib/utils';

export function AILeaf(props: PlateTextProps<typeof AIPlugin>) {
  const streaming = usePluginStore(AIChatPlugin, 'streaming');
  const streamingLeaf = props.editor
    .plugin(AIChatPlugin)
    .read.node({ streaming: true });

  const isLast = streamingLeaf?.[0] === props.text;

  return (
    <PlateText
      className={cn(
        'border-b-2 border-b-purple-100 bg-purple-50 text-purple-800',
        'transition-all duration-200 ease-in-out',
        isLast &&
          streaming &&
          'after:ml-1.5 after:inline-block after:h-3 after:w-3 after:rounded-full after:bg-primary after:align-middle after:content-[""]'
      )}
      {...props}
    />
  );
}

export function AIAnchorElement(props: PlateElementProps<typeof AIChatPlugin>) {
  return (
    <PlateElement {...props}>
      <div className="h-[0.1px]" />
    </PlateElement>
  );
}
