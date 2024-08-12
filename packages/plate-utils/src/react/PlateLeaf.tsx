import React from 'react';

import type { AnyPlatePlugin, PlateRenderLeafProps } from '@udecode/plate-core';
import type { TText } from '@udecode/slate';

import { Text, type TextProps, useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

export type PlateLeafProps<
  T extends TText = TText,
  P extends AnyPlatePlugin = AnyPlatePlugin,
> = {
  /** Get HTML attributes from Slate leaf. Alternative to `PlatePlugin.props`. */
  leafToAttributes?: (leaf: T) => any;
} & PlateRenderLeafProps<T, P> &
  TextProps;

export const usePlateLeaf = (props: PlateLeafProps) => {
  const {
    attributes,
    editor,
    leaf,
    leafToAttributes,
    nodeProps,
    plugin,
    text,
    ...rootProps
  } = props;

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...leafToAttributes?.(leaf),
      className: clsx(props.className, nodeProps?.className),
    },
    ref: useComposedRef(props.ref, (attributes as any).ref),
  };
};

/** Headless leaf component. */
const PlateLeaf = React.forwardRef<HTMLSpanElement, PlateLeafProps>(
  (props: PlateLeafProps, ref) => {
    const { props: rootProps, ref: rootRef } = usePlateLeaf({ ...props, ref });

    return <Text {...rootProps} ref={rootRef} />;
  }
) as (<N extends TText = TText, P extends AnyPlatePlugin = AnyPlatePlugin>({
  className,
  ...props
}: PlateLeafProps<N, P> &
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement) & {
  displayName?: string;
};
PlateLeaf.displayName = 'PlateLeaf';

export { PlateLeaf };
