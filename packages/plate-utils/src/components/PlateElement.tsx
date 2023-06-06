import React, { ReactElement, RefAttributes } from 'react';
import { PlateRenderElementProps } from '@udecode/plate-core';
import { EElement, TElement, Value } from '@udecode/slate';
import { clsx } from 'clsx';
import { Box, BoxProps, useComposedRef } from '..';

export type PlateElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>
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
      ...(elementToAttributes?.(element as T) ?? {}),
      className: clsx(props.className, nodeProps?.className),
    },
  };
};

/**
 * Headless element component.
 */
const PlateElement = React.forwardRef<HTMLDivElement, PlateElementProps>(
  (props: PlateElementProps) => {
    const { ref, props: rootProps } = usePlateElement(props);

    return <Box {...rootProps} ref={ref} />;
  }
) as (<V extends Value = Value, N extends TElement = EElement<V>>(
  props: PlateElementProps<V, N> & RefAttributes<HTMLDivElement>
) => ReactElement) & { displayName?: string };
PlateElement.displayName = 'PlateElement';

export { PlateElement };
