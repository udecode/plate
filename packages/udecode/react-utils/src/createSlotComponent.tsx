import { Slot } from '@radix-ui/react-slot';
import React from 'react';

export const createSlotComponent = <T extends React.ElementType>(element: T) =>
  React.forwardRef<
    React.ComponentRef<T>,
    {
      as?: React.ElementType;
      asChild?: boolean;
    } & React.ComponentPropsWithoutRef<T>
  >(({ as, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : (as ?? element);

    return <Comp ref={ref} {...props} />;
  });
