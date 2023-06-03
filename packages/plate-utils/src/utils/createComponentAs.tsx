/* eslint-disable react/display-name */
import React, { forwardRef, ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { isDefined } from '@udecode/utils';
import { AsProps, Children, Component, Props } from '../types/index';

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
  render: (props: Props<O>) => ReactElement | Children | null
) => {
  const Role = (props: Props<O>, ref: React.Ref<any>) =>
    render({ ref, ...props });

  return forwardRef(Role as any) as unknown as Component<O>;
};

export const createSlotComponent = <T, P = {}>(element: any) =>
  // eslint-disable-next-line react/display-name
  React.forwardRef<
    T,
    P & {
      asChild?: boolean;
    }
  >(({ asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : element;

    return <Comp ref={ref} {...props} />;
  });

type StateHook<O> = (options: O) => any;
type PropsHook<S> = (state: S) => any;

export const createPrimitiveComponent =
  <T, P = {}>(element: React.ElementType) =>
  <S = {}, O = {}>({
    propsHook,
    stateHook,
  }: {
    propsHook?: PropsHook<S>;
    stateHook?: StateHook<O>;
  } = {}) => {
    return React.forwardRef<
      T,
      {
        asChild?: boolean;
        // Provide your state instead of using the hook
        state?: S;
        // State options passed to the state hook
        options?: O;
      } & P
    >(({ asChild = false, options, state: _state, ...props }, ref) => {
      const state = isDefined(_state)
        ? _state
        : stateHook
        ? stateHook(options as any)
        : undefined;
      const { props: hookProps } = propsHook ? propsHook(state) : { props: {} };

      const Comp = asChild ? Slot : element;

      return <Comp ref={ref} {...hookProps} {...props} />;
    });
  };
