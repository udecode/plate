'use client';

import type { TElement } from '@udecode/plate';

import { cn } from '@udecode/cn';
import {
  type TSuggestionLineBreak,
  SUGGESTION_KEYS,
} from '@udecode/plate-suggestion';

export function BlockSuggestion({ element }: { element: TElement }) {
  const lineBreakData = element[
    SUGGESTION_KEYS.lineBreak
  ] as TSuggestionLineBreak;

  if (lineBreakData?.isLineBreak) return null;

  const isRemove = lineBreakData?.type === 'remove';

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-1 border-2 border-brand/[0.8] transition-opacity',
        isRemove && 'border-gray-300'
      )}
    />
  );
}
