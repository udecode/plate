'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import {
  type ExcalidrawPlugin,
  useExcalidrawElement,
} from '@platejs/excalidraw/react';
import { PlateElement, useEditorReadOnly } from 'platejs/react';

import { cn } from '@/lib/utils';

import '@excalidraw/excalidraw/index.css';

export function ExcalidrawElement(
  props: PlateElementProps<typeof ExcalidrawPlugin>
) {
  const { children, element } = props;
  const readOnly = useEditorReadOnly();

  const { Excalidraw, excalidrawProps } = useExcalidrawElement({
    element,
  });

  return (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <div
          className={cn(
            'mx-auto aspect-video h-[600px] w-[min(100%,600px)] overflow-hidden rounded-sm border'
          )}
        >
          {Excalidraw && (
            <Excalidraw {...excalidrawProps} viewModeEnabled={readOnly} />
          )}
        </div>
      </div>
      {children}
    </PlateElement>
  );
}
