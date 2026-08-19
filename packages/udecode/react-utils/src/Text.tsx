import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

export type TextProps = React.ComponentPropsWithRef<'span'> & {
  as?: React.ElementType;
  asChild?: boolean;
};

export function Text({
  as: Component = 'span',
  asChild = false,
  ref,
  ...props
}: TextProps) {
  const Comp = asChild ? Slot : Component;

  return <Comp ref={ref} {...props} />;
}
