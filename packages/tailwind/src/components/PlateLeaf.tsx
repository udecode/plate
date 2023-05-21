import React, { ReactElement, RefAttributes } from 'react';
import {
  EText,
  getRootProps,
  PlateRenderLeafProps,
  Text,
  TextProps,
  TText,
  Value,
} from '@udecode/plate-common';
import { cn } from '../cn';

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
        className={cn(nodeProps?.className, className)}
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
