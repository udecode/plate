import React from 'react';

import type { PlateRenderLeafProps } from '@udecode/plate-core';
import type { TText } from '@udecode/slate';

import { Text, type TextProps, useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

export type PlateLeafProps = {
  /** Get HTML attributes from Slate leaf. Alternative to `PlatePlugin.props`. */
  leafToAttributes?: (leaf: TText) => any;
} & PlateRenderLeafProps &
  TextProps;

export const usePlateLeaf = (props: PlateLeafProps) => {
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
) as (({
  className,
  ...props
}: PlateLeafProps &
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement) & {
  displayName?: string;
};
PlateLeaf.displayName = 'PlateLeaf';

export { PlateLeaf };
