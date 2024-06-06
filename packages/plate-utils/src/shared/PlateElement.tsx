import React from 'react';

import type { PlateRenderElementProps } from '@udecode/plate-core';
import type { EElement, TElement, Value } from '@udecode/slate';

import { Box, type BoxProps, useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

export type PlateElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>,
> = {
  /** Get HTML attributes from Slate element. Alternative to `PlatePlugin.props`. */
  elementToAttributes?: (element: N) => any;
} & BoxProps &
  PlateRenderElementProps<V, N>;

export const usePlateElement = <T extends TElement = TElement>(
  props: PlateElementProps<Value, T>
) => {
  const {
    attributes,
    editor,
    element,
    elementToAttributes,
    nodeProps,
    ...rootProps
  } = props;

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...elementToAttributes?.(element as T),
      className: clsx(props.className, nodeProps?.className),
    },
    ref: useComposedRef(props.ref, attributes.ref),
  };
};

/** Headless element component. */
const PlateElement = React.forwardRef<HTMLDivElement, PlateElementProps>(
  (props: PlateElementProps, ref) => {
    const { props: rootProps, ref: rootRef } = usePlateElement({
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
