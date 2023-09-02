/* eslint-disable react/display-name */

import React, { CSSProperties } from 'react';
import { isDefined } from '@udecode/utils';
import { clsx } from 'clsx';

import { useComposedRef } from '../hooks';
import { createSlotComponent } from './createSlotComponent';

/**
 * Primitive component factory. It uses hooks for managing
 * state and props, and forwards references to child components.
 * Component props:
 * - `asChild`: If true, the component will be rendered as a `Slot` {@link https://www.radix-ui.com/docs/primitives/utilities/slot}.
 * - `options`: Options passed to the state hook.
 * - `state`: Provide your state instead of using the state hook.
 * - `className`: Class name to be merged to the component.
 * - `style`: Style object to be merged to the component.
 * - `setProps`: Function to set props from the props hook.
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

  return <SH extends (options: any) => any, PH extends (state: any) => any>({
    propsHook,
    stateHook,
  }: {
    stateHook?: SH;
    propsHook?: PH;
  } = {}) => {
    return React.forwardRef<
      any,
      {
        as?: React.ElementType;
        asChild?: boolean;
        className?: string;
        style?: CSSProperties;
        options?: Parameters<SH>[0];
        state?: Parameters<PH>[0];
        setProps?: (hookProps: NonNullable<ReturnType<PH>['props']>) => P;
      } & P
    >(
      (
        {
          asChild,
          options,
          state: stateProp,
          className: classNameProp,
          getClassName,
          ...props
        },
        ref
      ) => {
        const state = isDefined(stateProp)
          ? stateProp
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
        const className =
          isDefined(hookProps?.className) || isDefined(classNameProp)
            ? clsx(hookProps?.className, classNameProp)
            : undefined;
        const style =
          hookProps?.style || props.style
            ? { ...hookProps?.style, ...props.style }
            : undefined;

        if (!asChild && hidden) return null;

        return (
          <Comp
            ref={_ref}
            asChild={asChild}
            {...hookProps}
            className={className}
            style={style}
            {...props}
            {...(props.setProps?.(hookProps ?? {}) ?? {})}
          />
        );
      }
    );
  };
};
