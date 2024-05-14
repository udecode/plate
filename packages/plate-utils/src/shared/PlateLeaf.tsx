import React from 'react';

import type { PlateRenderLeafProps } from '@udecode/plate-core';
import type { EText, TText, Value } from '@udecode/slate';

import { Text, type TextProps, useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

export type PlateLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>,
> = {
  /** Get HTML attributes from Slate leaf. Alternative to `PlatePlugin.props`. */
  leafToAttributes?: (leaf: N) => any;
} & PlateRenderLeafProps<V, N> &
  TextProps;

export const usePlateLeaf = <T extends TText = TText>(
  props: PlateLeafProps<Value, T>
) => {
  const {
    attributes,
    editor,
    leaf,
    leafToAttributes,
    nodeProps,
    text,
    ...rootProps
  } = props;

  return {
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...leafToAttributes?.(leaf as T),
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
) as (<V extends Value = Value, N extends TText = EText<V>>({
  className,
  ...props
}: PlateLeafProps<V, N> &
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement) & {
  displayName?: string;
};
PlateLeaf.displayName = 'PlateLeaf';

export { PlateLeaf };
