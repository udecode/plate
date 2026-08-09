import React from 'react';

import { createPrimitiveComponent } from '@udecode/react-utils';

import {
  type ResizableOptions,
  ResizeHandleProvider,
  useResizable,
  useResizableState,
  useResizeHandle,
  useResizeHandleState,
} from './useResizable';

export type { ResizableOptions, ResizeHandleOptions } from './useResizable';

export const Resizable = React.forwardRef<
  HTMLDivElement,
  {
    options: ResizableOptions;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ children, options, ...rest }, ref) => {
  const state = useResizableState(options);
  const { context, props, wrapperProps, wrapperRef } = useResizable(state);

  return (
    <div ref={wrapperRef} {...wrapperProps}>
      <div ref={ref} {...props} {...rest}>
        <ResizeHandleProvider {...context}>{children}</ResizeHandleProvider>
      </div>
    </div>
  );
});

Resizable.displayName = 'Resizable';

export const ResizeHandle = createPrimitiveComponent<
  'div',
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onResize'>
>('div')({
  propsHook: useResizeHandle,
  stateHook: useResizeHandleState,
});

export type ResizeHandleProps = React.ComponentPropsWithRef<
  typeof ResizeHandle
>;
