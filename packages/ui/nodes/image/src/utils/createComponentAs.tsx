import React, { forwardRef, ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { AsProps, Component, Props } from './types';

/**
 * Creates a type-safe component with the `as` prop and `React.forwardRef`.
 *
 * @example
 * import { createComponent } from "ariakit-utils/system";
 *
 * type Props = {
 *   as?: "div";
 *   customProp?: boolean;
 * };
 *
 * const Component = createComponent<Props>(({ customProp, ...props }) => {
 *   return <div {...props} />;
 * });
 *
 * <Component as="button" customProp />
 */
export function createComponentAs<O extends AsProps>(
  render: (props: Omit<Props<O>, 'asChild'>) => ReactElement | null
) {
  const Role = ({ asChild, ...props }: Props<O>, ref: React.Ref<any>) => {
    const Comp: any = asChild ? Slot : render;

    return Comp({ ref, ...props });
  };

  return (forwardRef(Role) as unknown) as Component<O>;
}
