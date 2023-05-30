import React from 'react';
import {
  ExcalidrawProps,
  LibraryItems,
} from '@excalidraw/excalidraw/types/types';
import { Value } from '@udecode/plate-common';
import { TExcalidrawElement } from '@udecode/plate-excalidraw';
import { PlateElement, PlateElementProps } from '@udecode/plate-tailwind';

import { useExalidawElementProps } from '@/lib/@/useExalidawElementProps';

export interface ExcalidrawElementProps
  extends PlateElementProps<Value, TExcalidrawElement> {
  scrollToContent?: boolean;

  libraryItems?: LibraryItems;

  excalidrawProps?: ExcalidrawProps;
}

export function ExcalidrawElement({
  nodeProps,
  ...props
}: ExcalidrawElementProps) {
  const {
    children,
    element,
    scrollToContent,
    libraryItems,
    excalidrawProps: _excalidrawProps,
  } = props;

  const { Excalidraw, excalidrawProps } = useExalidawElementProps({
    element,
    excalidrawProps: _excalidrawProps,
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
