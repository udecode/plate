'use client';

import * as React from 'react';

import type { TExcalidrawElement } from '@platejs/excalidraw';
import type { PlateElementProps } from 'platejs/react';

import { useExcalidrawElement } from '@platejs/excalidraw/react';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { PlateElement, useReadOnly } from 'platejs/react';

import { cn } from '@/lib/utils';
import { voidRemoveSuggestionClass } from '@/registry/ui/suggestion-node-static';

import '@excalidraw/excalidraw/index.css';

export function ExcalidrawElement(
  props: PlateElementProps<TExcalidrawElement>
) {
  const { children, element } = props;
  const readOnly = useReadOnly();
  const isRemoveSuggestion =
    props.editor.getApi(SuggestionPlugin).suggestion.suggestionData(element)
      ?.type === 'remove';

  const { Excalidraw, excalidrawProps } = useExcalidrawElement({
    element,
  });

  return (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <div
          className={cn(
            'mx-auto aspect-video h-[600px] w-[min(100%,600px)] overflow-hidden rounded-sm border',
            isRemoveSuggestion && voidRemoveSuggestionClass
          )}
        >
          {Excalidraw && (
            <Excalidraw
              {...(excalidrawProps as any)}
              viewModeEnabled={readOnly}
            />
          )}
        </div>
      </div>
      {children}
    </PlateElement>
  );
}
