/* eslint-disable react/display-name */
import React, { forwardRef, ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { isDefined } from '@udecode/utils';
import { useComposedRef } from '../hooks';
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

export const createSlotComponent = <
  T extends React.ElementType,
  P extends React.ComponentProps<T>
>(
  element: T
) =>
  // eslint-disable-next-line react/display-name
  React.forwardRef<
    any,
    P & {
      asChild?: boolean;
    }
  >(({ asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : element;

    return <Comp ref={ref} {...props} />;
  });

type StateHook<O> = (options: O) => any;
type PropsHook<S> = (state: S) => {
  ref?: any;
  props?: any;
  hidden?: boolean;
  [key: string]: unknown;
};

/**
 * Primitive component factory. It uses hooks for managing
 * state and props, and forwards references to child components.
 * Component props:
 * - `asChild`: If true, the component will be rendered as a `Slot` {@link https://www.radix-ui.com/docs/primitives/utilities/slot}.
 * - `options`: Options passed to the state hook.
 * - `state`: Provide your state instead of using the state hook.
 * - `...props`: Props to be passed to the component.
 * Props hook return value:
 * - `ref`: Reference to be forwarded to the component.
 * - `props`: Props to be passed to the component.
 * - `hidden`: If true, the component will not be rendered.
 *
 * @param {React.ElementType} element The base component or native HTML element.
 * @returns {function} A primitive component.
 *
 * @example
 *
 * const MyButton = createPrimitiveComponent(Button)({
 *   stateHook: useButtonState,
 *   propsHook: useButton
 * });
 */
export const createPrimitiveComponent = <
  T extends React.ElementType,
  P extends React.ComponentProps<T>
>(
  element: T
) => {
  const Comp = createSlotComponent<T, P>(element);

  return <S = {}, O = {}>({
    propsHook,
    stateHook,
  }: {
    propsHook?: PropsHook<S>;
    stateHook?: StateHook<O>;
  } = {}) => {
    return React.forwardRef<
      any,
      {
        asChild?: boolean;
        state?: S;
        options?: O;
      } & P
    >(({ asChild, options, state: _state, ...props }, ref) => {
      const state = isDefined(_state)
        ? _state
        : stateHook
        ? stateHook(options as any)
        : undefined;
      const {
        ref: hookRef,
        props: hookProps,
        hidden,
      } = propsHook
        ? propsHook(state)
        : { props: {}, hidden: false, ref: null };

      const _ref = useComposedRef(ref, hookRef);

      if (!asChild && hidden) return null;

      return <Comp ref={_ref} asChild={asChild} {...hookProps} {...props} />;
    });
  };
};
