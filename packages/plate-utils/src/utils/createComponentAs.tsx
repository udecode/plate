import React, { forwardRef, ReactElement } from 'react';
import { AsProps, Component, Props } from '../types/index';

/**
 * Creates a type-safe component with the `as` prop and `React.forwardRef`.
 *
 * @example
 * import { createComponent } from "ariakit-react-utils/system";
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
  render: (props: Props<O>) => ReactElement
) => {
  const Role = (props: Props<O>, ref: React.Ref<any>) =>
    render({ ref, ...props });

  return (forwardRef(Role) as unknown) as Component<O>;
};
