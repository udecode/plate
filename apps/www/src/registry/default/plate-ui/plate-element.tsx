'use client';

import React from 'react';

import type { PlateElementProps } from '@udecode/plate/react';

import { isSuggestionElement } from '@udecode/plate-suggestion';
import { PlateElement as PlateElementPrimitive } from '@udecode/plate/react';

import { BlockSelection } from './block-selection';
import { BlockSuggestion } from './block-suggestion';

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
      {isSuggestionElement(props.element) && (
        <BlockSuggestion element={props.element} />
      )}
    </PlateElementPrimitive>
  );
});
