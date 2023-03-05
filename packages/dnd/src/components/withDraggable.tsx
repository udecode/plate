import React, { forwardRef } from 'react';
import {
  AnyObject,
  PlateRenderElementProps,
  RenderFunction,
} from '@udecode/plate-core';
import {
  useWithDraggableState,
  WithDraggableOptions,
} from './useWithDraggableState';

export const withDraggable = <T extends AnyObject = AnyObject>(
  Draggable: RenderFunction<any>,
  Component: RenderFunction<any>,
  options?: WithDraggableOptions<T>
) =>
  forwardRef<HTMLDivElement, PlateRenderElementProps>((props, ref) => {
    const { disabled, draggableProps } = useWithDraggableState({
      ...options,
      ...props,
    });

    if (disabled) {
      return <Component {...props} />;
    }

    return (
      <Draggable ref={ref} {...draggableProps}>
        <Component {...props} />
      </Draggable>
    );
  });
