import {
  ComponentPropsWithRef,
  ElementType,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  RefAttributes,
} from 'react';
import { AnyObject } from '@udecode/utils';

// /**
//  * Workaround for variance issues.
//  * @template T The type of the callback.
//  */
// export type BivariantCallback<T extends AnyFunction> = {
//   bivarianceHack(...args: Parameters<T>): ReturnType<T>;
// }["bivarianceHack"];
//
// /**
//  * @template T The state type.
//  */
// export type SetStateAction<T> = T | BivariantCallback<(prevState: T) => T>;
//
// /**
//  * The type of the `setState` function in `[state, setState] = useState()`.
//  * @template T The type of the state.
//  */
// export type SetState<T> = BivariantCallback<(value: SetStateAction<T>) => void>;
//
// /**
//  * A boolean value or a callback that returns a boolean value.
//  * @template T The type of the callback parameter. By default, the function will
//  * have no parameter.
//  */
// export type BooleanOrCallback<T = never> =
//   | boolean
//   | BivariantCallback<T extends never ? () => boolean : (arg: T) => boolean>;
//
// /**
//  * A string that will provide autocomplete for specific strings.
//  * @template T The specific strings.
//  */
// export type StringWithValue<T extends string> =
//   | T
//   | (string & { [key in symbol]: never });

export type ClassNames<T> = {
  classNames?: Partial<T>;
};

/**
 * Render prop type.
 * @template P Props
 * @example
 * const children: RenderProp = (props) => <div {...props} />;
 */
export type RenderProp<P = AnyObject> = (props: P) => ReactNode;

/**
 * The `as` prop.
 * @template P Props
 */
export type As<P = any> = ElementType<P>;

/**
 * The `wrapElement` prop.
 */
export type WrapElement = (element: ReactElement) => ReactElement;

/**
 * The `children` prop that supports a function.
 * @template T Element type.
 */
export type Children<T = any> =
  | ReactNode
  | RenderProp<HTMLAttributes<T> & RefAttributes<T>>;

/**
 * Props with the `as` prop.
 * @template T The `as` prop
 * @example
 * type ButtonAsProps = AsProps<"button">;
 */
export type AsProps<T extends As = any> = {
  as?: T;

  /**
   * Alias to `as` to avoid conflict with styled-components `as` prop.
   */
  asAlias?: T;
};

/**
 * Props that automatically includes HTML props based on the `as` prop.
 * @template O AsProps
 * @example
 * type ButtonHTMLProps = HTMLProps<AsProps<"button">>;
 */
export type HTMLProps<O extends AsProps> = {
  wrapElement?: WrapElement;
  children?: Children;
  [index: `data-${string}`]: unknown;
} & Omit<ComponentPropsWithRef<NonNullable<O['as']>>, keyof O | 'children'>;

/**
 * AsProps & HTMLProps
 * @template O AsProps
 * @example
 * type ButtonProps = Props<AsProps<"button">>;
 */
export type Props<O extends AsProps> = O & HTMLProps<O>;

export type HTMLPropsAs<T extends As = any> = AsProps & HTMLProps<AsProps<T>>;

/**
 * A component that supports the `as` prop and the `children` prop as a
 * function.
 * @see https://github.com/ariakit/ariakit/blob/9977b070180e27be40068e0cc464e78dda68d594/packages/ariakit-utils/src/types.ts#L117
 * @template O AsProps
 * @example
 * type ButtonComponent = Component<AsProps<"button">>;
 */
export type Component<O extends AsProps> = {
  <T extends As>(
    props: Omit<O, 'as'> &
      Omit<HTMLProps<AsProps<T>>, keyof O> &
      Required<AsProps<T>>
  ): JSX.Element | null;
  (props: Props<O>): JSX.Element | null;
  displayName?: string;
};

// /**
//  * A component hook that supports the `as` prop and the `children` prop as a
//  * function.
//  * @template O AsProps
//  * @example
//  * type ButtonHook = Hook<AsProps<"button">>;
//  */
// export type Hook<O extends AsProps> = {
//   <T extends As = NonNullable<O["as"]>>(
//     props?: Omit<O, "as"> & Omit<HTMLProps<AsProps<T>>, keyof O> & AsProps<T>
//   ): HTMLProps<AsProps<T>>;
//   displayName?: string;
// };
