'use client';

import * as React from 'react';

import type { TExcalidrawElement } from '@udecode/plate-excalidraw';
import type { PlateElementProps } from '@udecode/plate/react';

import { useExcalidrawElement } from '@udecode/plate-excalidraw/react';
import { PlateElement } from '@udecode/plate/react';

export function ExcalidrawElement(
  props: PlateElementProps<TExcalidrawElement>
) {
  const { children, element } = props;

  const { Excalidraw, excalidrawProps } = useExcalidrawElement({
    element,
  });

  return (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <div className="mx-auto aspect-video h-[600px] w-[min(100%,600px)] overflow-hidden rounded-sm border">
          {Excalidraw && <Excalidraw {...(excalidrawProps as any)} />}
        </div>
      </div>
      {children}
    </PlateElement>
  );
}
