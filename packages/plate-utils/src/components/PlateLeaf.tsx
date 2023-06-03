import React, { ReactElement, RefAttributes } from 'react';
import { PlateRenderLeafProps } from '@udecode/plate-core';
import { EText, TText, Value } from '@udecode/slate';
import { clsx } from 'clsx';
import { getRootProps, Text, TextProps } from '..';

export type PlateLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>
> = PlateRenderLeafProps<V, N> & TextProps;

/**
 * Headless leaf component.
 */
const PlateLeaf = React.forwardRef<HTMLSpanElement, PlateLeafProps>(
  ({ className, ...props }: PlateLeafProps) => {
    const { attributes, children, nodeProps } = props;

    const rootProps = getRootProps(props);

    return (
      <Text
        {...attributes}
        {...rootProps}
        {...nodeProps}
        className={clsx(nodeProps?.className, className)}
      >
        {children}
      </Text>
    );
  }
) as (<V extends Value = Value, N extends TText = EText<V>>({
  className,
  ...props
}: PlateLeafProps<V, N> & RefAttributes<HTMLSpanElement>) => ReactElement) & {
  displayName?: string;
};
PlateLeaf.displayName = 'PlateLeaf';

export { PlateLeaf };
