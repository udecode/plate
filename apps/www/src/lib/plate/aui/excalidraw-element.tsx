import React from 'react';
import { LibraryItems } from '@excalidraw/excalidraw/types/types';
import { PlateElement } from '@udecode/plate';
import { PlateElementProps, Value } from '@udecode/plate-common';
import { TExcalidrawElement } from '@udecode/plate-excalidraw';

import { useExalidawElement } from '@/lib/@/useExalidawElement';

export interface ExcalidrawElementProps
  extends PlateElementProps<Value, TExcalidrawElement> {
  scrollToContent?: boolean;

  libraryItems?: LibraryItems;
}

export function ExcalidrawElement({
  nodeProps,
  ...props
}: ExcalidrawElementProps) {
  const { children, element, scrollToContent, libraryItems } = props;

  const { Excalidraw, excalidrawProps } = useExalidawElement({
    element,
    scrollToContent,
    libraryItems,
  });

  return (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <div className="h-[600px]">
          {Excalidraw && (
            <Excalidraw {...nodeProps} {...(excalidrawProps as any)} />
          )}
        </div>
      </div>
      {children}
    </PlateElement>
  );
}
