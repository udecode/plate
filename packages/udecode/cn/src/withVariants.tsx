import type { cva, VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from './cn';

export type WithVariantsProps<
  T extends React.ElementType,
  V extends ReturnType<typeof cva>,
> = Omit<
  React.ComponentPropsWithoutRef<T>,
  'className' | keyof VariantProps<V>
> &
  VariantProps<V> & { className?: string };

/**
 * Set default `className` with `cn` and `variants`.
 *
 * @param Component - The component to which props will be added.
 * @param variants - Variants from `cva`. `Component` props will be extended
 *   with `variants` props.
 * @param onlyVariantsProps - Props to exclude from `Component`. Set the props
 *   that are only used for variants.
 */
export function withVariants<
  T extends React.ElementType,
  V extends ReturnType<typeof cva>,
>(
  Component: 'className' extends keyof React.ComponentPropsWithoutRef<T>
    ? T
    : never,
  variants: V,
  onlyVariantsProps?: (keyof VariantProps<V>)[]
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<WithVariantsProps<T, V>> &
    React.RefAttributes<React.ComponentRef<T>>
> {
  return React.forwardRef<React.ComponentRef<T>, WithVariantsProps<T, V>>(
    function WithVariants(props, ref) {
      const className =
        'className' in props && typeof props.className === 'string'
          ? props.className
          : undefined;
      const componentProps: Record<string, unknown> = { ...props };
      // `forwardRef` wraps the generic props in `PropsWithoutRef`; CVA consumes
      // the variant subset of that same object.
      const variantProps = props as unknown as Parameters<V>[0];

      Reflect.deleteProperty(componentProps, 'className');

      if (onlyVariantsProps) {
        onlyVariantsProps.forEach((key) => {
          if (key in componentProps) {
            Reflect.deleteProperty(componentProps, key);
          }
        });
      }

      return React.createElement(Component, {
        ...componentProps,
        className: cn(variants(variantProps), className),
        ref,
      });
    }
  );
}
