import React from 'react';

import type { TText } from '@udecode/slate';

import {
  type AnyPlatePlugin,
  type PlateRenderLeafProps,
  omitPluginContext,
} from '@udecode/plate-core/react';
import { type TextProps, Text } from '@udecode/react-utils';
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
  const { leaf, leafToAttributes, nodeProps, text, ...rootProps } =
    omitPluginContext(props);

  const className = clsx(props.className, nodeProps?.className);

  return {
    props: {
      ...rootProps,
      ...nodeProps,
      ...leafToAttributes?.(leaf),
      className: className || undefined,
    },
    ref: props.ref,
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
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement<any>) & {
  displayName?: string;
};
PlateLeaf.displayName = 'PlateLeaf';

export { PlateLeaf };
