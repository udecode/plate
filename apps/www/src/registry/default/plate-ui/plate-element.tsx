'use client';

import React from 'react';

import type { TElement } from '@udecode/plate';
import type { PlateElementProps } from '@udecode/plate/react';

import { cn } from '@udecode/cn';
import {
  type TSuggestionLineBreak,
  SUGGESTION_KEYS,
} from '@udecode/plate-suggestion';
import { PlateElement as PlateElementPrimitive } from '@udecode/plate/react';

import { BlockSelection } from './block-selection';

const BlockSuggestion = ({ element }: { element: TElement }) => {
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
    ></div>
  );
};

export const PlateElement = React.forwardRef<
  HTMLDivElement,
  PlateElementProps & { blockSelectionClassName?: string }
>(({ blockSelectionClassName, children, ...props }, ref) => {
  return (
    <PlateElementPrimitive ref={ref} {...props}>
      {children}

      {props.className?.includes('slate-selectable') && (
        <BlockSelection className={blockSelectionClassName} />
      )}
      {props.element[SUGGESTION_KEYS.lineBreak] && (
        <BlockSuggestion element={props.element} />
      )}
    </PlateElementPrimitive>
  );
});
