import { isDefined } from '@udecode/utils';
import { clsx } from 'clsx';
import React from 'react';

import { createSlotComponent } from './createSlotComponent';
import { useComposedRef } from './useComposedRef';

type DataAttributes = {
  [key: `data-${string}`]: unknown;
};

type PrimitiveHookProps<P> = Partial<P> &
  Partial<DataAttributes> & {
    className?: string;
    style?: React.CSSProperties;
  };

type PrimitiveHookResult<HookProps, Ref> = {
  hidden?: boolean;
  props?: HookProps;
  ref?: React.Ref<Ref>;
};

type PrimitiveConfig<Options, State, HookProps, Ref> =
  | {
      propsHook?: (state: State) => PrimitiveHookResult<HookProps, Ref>;
      stateHook: (options: Options) => State;
    }
  | {
      propsHook?: () => PrimitiveHookResult<HookProps, Ref>;
      stateHook?: never;
    };

type PrimitiveOptionsProp<Options> = undefined extends Options
  ? { options?: Options }
  : { options: Options };

/**
 * Primitive component factory. It uses hooks for managing state and props, and
 * forwards references to child components. Component props:
 *
 * - `asChild`: If true, the component will be rendered as a `Slot`
 *   {@link https://www.radix-ui.com/docs/primitives/utilities/slot}.
 * - `options`: Options passed to the state hook.
 * - `state`: Provide your state instead of using the state hook.
 * - `className`: Class name to be merged to the component.
 * - `style`: Style object to be merged to the component.
 * - `setProps`: Function to set props from the props hook.
 * - `...props`: Props to be passed to the component. Props hook return value:
 * - `ref`: Reference to be forwarded to the component.
 * - `props`: Props to be passed to the component.
 * - `hidden`: If true, the component will not be rendered.
 *
 * @example
 *   const MyButton = createPrimitiveComponent(Button)({
 *     stateHook: useButtonState,
 *     propsHook: useButton,
 *   });
 *
 * @param {React.ElementType} element The base component or native HTML element.
 * @returns {function} A primitive component.
 */
export const createPrimitiveComponent = <
  T extends React.ElementType,
  P extends React.ComponentPropsWithoutRef<T>,
>(
  element: T
) => {
  const Comp = createSlotComponent(element);

  return <Options, State, HookProps extends PrimitiveHookProps<P>>(
    config: PrimitiveConfig<
      Options,
      State,
      HookProps,
      React.ComponentRef<T>
    > = {}
  ) =>
    React.forwardRef<
      React.ComponentRef<T>,
      PrimitiveOptionsProp<Options> & {
        as?: React.ElementType;
        asChild?: boolean;
        className?: string;
        state?: State;
        style?: React.CSSProperties;
        setProps?: (hookProps: HookProps) => PrimitiveHookProps<P>;
      } & P
    >(
      (
        {
          asChild,
          className: classNameProp,
          options,
          setProps,
          state: stateProp,
          style: styleProp,
          ...props
        },
        ref
      ) => {
        const hookResult = config.stateHook
          ? config.propsHook?.(
              isDefined(stateProp) ? stateProp : config.stateHook(options)
            )
          : config.propsHook?.();
        const { hidden, props: hookProps, ref: hookRef } = hookResult ?? {};

        const _ref = useComposedRef(ref, hookRef);
        const className =
          isDefined(hookProps?.className) || isDefined(classNameProp)
            ? clsx(hookProps?.className, classNameProp)
            : undefined;
        const style =
          hookProps?.style || styleProp
            ? { ...hookProps?.style, ...styleProp }
            : undefined;

        if (hidden) return null;

        return (
          <Comp
            asChild={asChild}
            ref={_ref}
            {...hookProps}
            className={className}
            style={style}
            {...props}
            {...(hookProps ? setProps?.(hookProps) : undefined)}
          />
        );
      }
    );
};
