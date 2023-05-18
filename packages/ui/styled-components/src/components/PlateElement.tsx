import React, { ReactElement, RefAttributes } from 'react';
import {
  Box,
  BoxProps,
  EElement,
  PlateRenderElementProps,
  TElement,
  Value,
} from '@udecode/plate-common';
import { cn } from '../utils';
import { getRootProps } from '../utils/getRootProps';

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
        className={cn(
          rootProps.className,
          nodeProps?.className,
          className,
          'bg-red-400'
        )}
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
