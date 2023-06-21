import React, { ReactElement, RefAttributes } from 'react';
import { PlateRenderLeafProps } from '@udecode/plate-core';
import { EText, TText, Value } from '@udecode/slate';
import { clsx } from 'clsx';
import { Text, TextProps, useComposedRef } from '..';

export type PlateLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>
> = PlateRenderLeafProps<V, N> &
  TextProps & {
    /**
     * Get HTML attributes from Slate leaf. Alternative to `PlatePlugin.props`.
     */
    leafToAttributes?: (leaf: N) => any;
  };

export const usePlateLeaf = <T extends TText = TText>(
  props: PlateLeafProps<Value, T>
) => {
  const {
    editor,
    attributes,
    nodeProps,
    text,
    leaf,
    leafToAttributes,
    ...rootProps
  } = props;

  return {
    ref: useComposedRef(props.ref, (attributes as any).ref),
    props: {
      ...attributes,
      ...rootProps,
      ...nodeProps,
      ...leafToAttributes?.(leaf as T),
      className: clsx(props.className, nodeProps?.className),
    },
  };
};

/**
 * Headless leaf component.
 */
const PlateLeaf = React.forwardRef<HTMLSpanElement, PlateLeafProps>(
  (props: PlateLeafProps, ref) => {
    const { ref: rootRef, props: rootProps } = usePlateLeaf({ ...props, ref });

    return <Text {...rootProps} ref={rootRef} />;
  }
) as (<V extends Value = Value, N extends TText = EText<V>>({
  className,
  ...props
}: PlateLeafProps<V, N> & RefAttributes<HTMLSpanElement>) => ReactElement) & {
  displayName?: string;
};
PlateLeaf.displayName = 'PlateLeaf';

export { PlateLeaf };
