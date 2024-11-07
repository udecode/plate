import React from 'react';

import {
  type AnyPlatePlugin,
  type PlateRenderElementProps,
  omitPluginContext,
} from '@udecode/plate-core/react';
import { type BoxProps, Box, useComposedRef } from '@udecode/react-utils';
import { type TElement, isBlock } from '@udecode/slate';
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

  const block = React.useMemo(
    () => !!element.id && isBlock(props.editor, element),
    [element, props.editor]
  );

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...elementToAttributes?.(element),
      className: clsx(props.className, nodeProps?.className),
      'data-block-id': block ? element.id : undefined,
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
    const { 'data-block-id': blockId, ...rest } = rootProps;

    return <Box data-block-id={blockId} {...rest} ref={rootRef} />;
  }
) as (<
  N extends TElement = TElement,
  P extends AnyPlatePlugin = AnyPlatePlugin,
>(
  props: PlateElementProps<N, P> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement) & { displayName?: string };
PlateElement.displayName = 'PlateElement';

export { PlateElement };
