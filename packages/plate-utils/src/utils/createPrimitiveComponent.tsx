/* eslint-disable react/display-name */

import React from 'react';
import { isDefined } from '@udecode/utils';

import { useComposedRef } from '../hooks';
import { createSlotComponent } from './createSlotComponent';

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
  P extends React.ComponentPropsWithoutRef<T>,
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
        as?: React.ElementType;
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
