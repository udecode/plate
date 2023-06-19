import React, { forwardRef } from 'react';
import { AnyObject, PlateRenderElementProps } from '@udecode/plate-common';
import { useWithDraggable, WithDraggableOptions } from './useWithDraggable';

export const withDraggable = <T extends AnyObject = AnyObject>(
  Draggable: React.FC<any>,
  Component: React.FC<any>,
  options?: WithDraggableOptions<T>
) =>
  // eslint-disable-next-line react/display-name
  forwardRef<HTMLDivElement, PlateRenderElementProps>((props, ref) => {
    const { disabled, draggableProps } = useWithDraggable({
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
