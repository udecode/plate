import React from 'react';

type ElementType<P = any> =
  | {
      [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K]
        ? K
        : never;
    }[keyof JSX.IntrinsicElements]
  | React.ComponentType<P>;

type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

type InferElementRef<T> =
  T extends ElementType<any>
    ? T extends keyof JSX.IntrinsicElements
      ? JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<
          React.HTMLAttributes<infer R>,
          any
        >
        ? R
        : never
      : T extends React.ComponentType<any>
        ? T extends React.ComponentClass<any>
          ? InstanceType<T>
          : T extends React.ForwardRefExoticComponent<any>
            ? React.ComponentPropsWithRef<T>['ref'] extends React.Ref<infer R>
              ? R
              : never
            : never
        : never
    : never;

/**
 * Shorter alternative to `React.forwardRef`.
 *
 * @generic1 Component type or element type
 * @generic2 Extended prop types
 */
export function withRef<T extends ElementType, P = {}>(
  renderFunction: React.ForwardRefRenderFunction<
    InferElementRef<T>,
    React.ComponentPropsWithoutRef<T> & P
  >
): ForwardRefComponent<
  InferElementRef<T>,
  React.ComponentPropsWithoutRef<T> & P
> {
  return React.forwardRef(renderFunction as any) as any;
}
