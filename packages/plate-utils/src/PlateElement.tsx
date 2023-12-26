import React from 'react';
import { PlateRenderElementProps } from '@udecode/plate-core';
import { Box, BoxProps, useComposedRef } from '@udecode/react-utils';
import { EElement, TElement, Value } from '@udecode/slate';
import { clsx } from 'clsx';

export type PlateElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>,
> = PlateRenderElementProps<V, N> &
  BoxProps & {
    /**
     * Get HTML attributes from Slate element. Alternative to `PlatePlugin.props`.
     */
    elementToAttributes?: (element: N) => any;
  };

export const usePlateElement = <T extends TElement = TElement>(
  props: PlateElementProps<Value, T>
) => {
  const {
    editor,
    attributes,
    nodeProps,
    element,
    elementToAttributes,
    ...rootProps
  } = props;

  return {
    ref: useComposedRef(props.ref, attributes.ref),
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...elementToAttributes?.(element as T),
      className: clsx(props.className, nodeProps?.className),
    },
  };
};

/**
 * Headless element component.
 */
const PlateElement = React.forwardRef<HTMLDivElement, PlateElementProps>(
  (props: PlateElementProps, ref) => {
    const { ref: rootRef, props: rootProps } = usePlateElement({
      ...props,
      ref,
    });

    return <Box {...rootProps} ref={rootRef} />;
  }
) as (<V extends Value = Value, N extends TElement = EElement<V>>(
  props: PlateElementProps<V, N> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement) & { displayName?: string };
PlateElement.displayName = 'PlateElement';

export { PlateElement };
