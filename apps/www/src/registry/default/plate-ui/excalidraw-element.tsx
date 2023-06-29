import React from 'react';
import { LibraryItems } from '@excalidraw/excalidraw/types/types';
import { PlateElement, PlateElementProps, Value } from '@udecode/plate-common';
import {
  TExcalidrawElement,
  useExalidawElement,
} from '@udecode/plate-excalidraw';

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
