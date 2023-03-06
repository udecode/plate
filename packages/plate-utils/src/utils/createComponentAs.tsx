import React, { forwardRef, ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { AsProps, Children, Component, Props } from '../../../core/src/types';

/**
 * Creates a type-safe component with the `as` prop and `React.forwardRef`.
 * Also supports `asChild` prop.
 *
 * @see https://www.radix-ui.com/docs/primitives/overview/styling#changing-the-rendered-element
 * @see https://github.com/ariakit/ariakit/blob/ddd19e97a07a21e4d5fc93719d1fdc5bdab697f7/packages/ariakit-utils/src/system.tsx#L33
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
export const createComponentAs = <O extends AsProps>(
  render: (props: Omit<Props<O>, 'asChild'>) => ReactElement | Children | null
) => {
  const Role = ({ asChild, ...props }: Props<O>, ref: React.Ref<any>) => {
    const Comp: any = asChild ? Slot : render;

    return Comp({ ref, ...props });
  };

  return (forwardRef(Role) as unknown) as Component<O>;
};
