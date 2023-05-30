import React from 'react';
import { TSuggestionText, Value } from '@udecode/plate';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate-tailwind';
import { cva } from 'class-variance-authority';

import { useSuggestionLeafState } from '@/lib/@/useSuggestionLeafState';
import { cn } from '@/lib/utils';

// eslint-disable-next-line tailwindcss/no-contradicting-classname
const suggestionLeafVariants = cva(
  'border-b-2 border-[--suggestion-primary-color] text-[--suggestion-primary-color] transition-colors',
  {
    variants: {
      isActive: {
        false: 'bg-[--suggestion-accent-color]',
        true: '',
      },
      isDeletion: {
        false: '',
        true: 'line-through decoration-[--suggestion-primary-color] decoration-2',
      },
    },
  }
);

export function SuggestionLeaf({
  className,
  children,
  ...props
}: PlateLeafProps<Value, TSuggestionText>) {
  const { suggestionBlockAbove, isActive, isDeletion, hue } =
    useSuggestionLeafState(props);

  if (suggestionBlockAbove) return <>{children}</>;

  return (
    <PlateLeaf
      as={isDeletion ? 'del' : 'span'}
      className={cn(
        suggestionLeafVariants({
          isActive,
          isDeletion,
        }),
        className
      )}
      style={{
        ['--suggestion-primary-color' as any]: `hsl(${hue}, 60%, 25%)`, // TW 800
        ['--suggestion-accent-color' as any]: `hsl(${hue}, 89%, 93%)`, // TW 100
      }}
      {...props}
    >
      {children}
    </PlateLeaf>
  );
}
