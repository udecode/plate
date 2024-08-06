import React from 'react';

import type { PlateRenderElementProps } from '@udecode/plate-core';
import type { TElement } from '@udecode/slate';

import { Box, type BoxProps, useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

export type PlateElementProps = {
  /** Get HTML attributes from Slate element. Alternative to `PlatePlugin.props`. */
  elementToAttributes?: (element: TElement) => any;
} & BoxProps &
  PlateRenderElementProps;

export const usePlateElement = (props: PlateElementProps) => {
  const {
    attributes,
    editor,
    element,
    elementToAttributes,
    nodeProps,
    plugin,
    ...rootProps
  } = props;

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
) as ((
  props: PlateElementProps & React.RefAttributes<HTMLDivElement>
) => React.ReactElement) & { displayName?: string };
PlateElement.displayName = 'PlateElement';

export { PlateElement };
