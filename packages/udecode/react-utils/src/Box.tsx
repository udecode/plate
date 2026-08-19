import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

export type BoxProps = React.ComponentPropsWithRef<'div'> & {
  as?: React.ElementType;
  asChild?: boolean;
};

export function Box({
  as: Component = 'div',
  asChild = false,
  ref,
  ...props
}: BoxProps) {
  const Comp = asChild ? Slot : Component;

  return <Comp ref={ref} {...props} />;
}
