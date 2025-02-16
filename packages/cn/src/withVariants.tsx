import React from 'react';

import type { cva, VariantProps } from 'class-variance-authority';

import { cn } from './cn';

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
>(Component: T, variants: V, onlyVariantsProps?: (keyof VariantProps<V>)[]) {
  return React.forwardRef<
    React.ComponentRef<T>,
    React.ComponentPropsWithoutRef<T> &
      Omit<React.ComponentProps<T>, keyof VariantProps<V>> &
      VariantProps<V>
  >((props, ref) => {
    const { className, ...rest } = props;
    const variantProps = { ...rest } as VariantProps<V>;
    const componentProps = { ...rest } as any;

    if (onlyVariantsProps) {
      onlyVariantsProps.forEach((key) => {
        if (key in componentProps) {
          delete componentProps[key as string];
        }
      });
    }

    return (
      <Component
        ref={ref}
        className={cn(variants(variantProps), className)}
        {...componentProps}
      />
    );
  });
}
