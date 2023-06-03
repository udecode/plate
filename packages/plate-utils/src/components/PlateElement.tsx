import React, { ReactElement, RefAttributes } from 'react';
import { PlateRenderElementProps } from '@udecode/plate-core';
import { EElement, TElement, Value } from '@udecode/slate';
import { clsx } from 'clsx';
import { Box, BoxProps, getRootProps } from '..';

export type PlateElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>
> = PlateRenderElementProps<V, N> & BoxProps;

/**
 * Headless element component.
 */
const PlateElement = React.forwardRef<HTMLDivElement, PlateElementProps>(
  ({ className, ...props }: PlateElementProps) => {
    const { attributes, children, nodeProps } = props;

    const rootProps = getRootProps(props);

    return (
      <Box
        {...attributes}
        {...rootProps}
        {...nodeProps}
        className={clsx(nodeProps?.className, className)}
      >
        {children}
      </Box>
    );
  }
) as (<V extends Value = Value, N extends TElement = EElement<V>>(
  props: PlateElementProps<V, N> & RefAttributes<HTMLDivElement>
) => ReactElement) & { displayName?: string };
PlateElement.displayName = 'PlateElement';

export { PlateElement };
