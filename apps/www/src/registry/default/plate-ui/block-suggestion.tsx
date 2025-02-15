'use client';

import type { TSuggestionElement } from '@udecode/plate-suggestion';

import { cn } from '@udecode/cn';

export function BlockSuggestion({ element }: { element: TSuggestionElement }) {
  const suggestionData = element.suggestion;

  if (suggestionData?.isLineBreak) return null;

  const isRemove = suggestionData?.type === 'remove';

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-1 border-2 border-brand/[0.8] transition-opacity',
        isRemove && 'border-gray-300'
      )}
      contentEditable={false}
    />
  );
}
