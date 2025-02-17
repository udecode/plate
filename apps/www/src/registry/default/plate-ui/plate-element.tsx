'use client';

import React from 'react';

import type { PlateElementProps } from '@udecode/plate/react';

import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { PlateElement as PlateElementPrimitive } from '@udecode/plate/react';

import { BlockSelection } from './block-selection';
import { BlockSuggestion } from './block-suggestion';

export const PlateElement = React.forwardRef<
  HTMLDivElement,
  PlateElementProps & { blockSelectionClassName?: string }
>(({ blockSelectionClassName, children, editor, ...props }, ref) => {
  return (
    <PlateElementPrimitive ref={ref} editor={editor} {...props}>
      {children}

      {props.className?.includes('slate-selectable') && (
        <BlockSelection className={blockSelectionClassName} />
      )}

      {editor
        .getApi(SuggestionPlugin)
        .suggestion.isBlockSuggestion(props.element) && (
        <BlockSuggestion element={props.element} />
      )}
    </PlateElementPrimitive>
  );
});
