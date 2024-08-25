import React from 'react';

import type { TElement } from '@udecode/slate';

import {
  type AnyPlatePlugin,
  type PlateRenderElementProps,
  omitPluginContext,
} from '@udecode/plate-core/react';
import { Box, type BoxProps, useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

export type PlateElementProps<
  N extends TElement = TElement,
  P extends AnyPlatePlugin = AnyPlatePlugin,
> = {
  /** Get HTML attributes from Slate element. Alternative to `PlatePlugin.props`. */
  elementToAttributes?: (element: N) => any;
} & BoxProps &
  PlateRenderElementProps<N, P>;

export const usePlateElement = (props: PlateElementProps) => {
  const { attributes, element, elementToAttributes, nodeProps, ...rootProps } =
    omitPluginContext(props);

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...elementToAttributes?.(element),
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
) as (<
  N extends TElement = TElement,
  P extends AnyPlatePlugin = AnyPlatePlugin,
>(
  props: PlateElementProps<N, P> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement) & { displayName?: string };
PlateElement.displayName = 'PlateElement';

export { PlateElement };
