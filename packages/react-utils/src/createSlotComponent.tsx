import React from 'react';

import { Slot } from '@radix-ui/react-slot';

export const createSlotComponent = <
  T extends React.ElementType,
  P extends React.ComponentPropsWithoutRef<T>,
>(
  element: T
) =>
  // eslint-disable-next-line react/display-name
  React.forwardRef<
    any,
    {
      as?: React.ElementType;
      asChild?: boolean;
    } & P
  >(({ as, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : (as as T) || element;

    return <Comp ref={ref} {...props} />;
  });
