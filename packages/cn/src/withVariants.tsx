import React from 'react';

import type { VariantProps, cva } from 'class-variance-authority';

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
  T extends React.ComponentType<any> | keyof HTMLElementTagNameMap,
  V extends ReturnType<typeof cva>,
>(Component: T, variants: V, onlyVariantsProps?: (keyof VariantProps<V>)[]) {
  const ComponentWithClassName = Component as React.FC<{ className: string }>;

  return React.forwardRef<
    React.ElementRef<T>,
    React.ComponentPropsWithoutRef<T> & VariantProps<V>
  >(function ExtendComponent(allProps, ref) {
    const { className, ...props } = allProps as any;
    const rest = { ...props };

    if (onlyVariantsProps) {
      onlyVariantsProps.forEach((key) => {
        if (props[key as string] !== undefined) {
          delete rest[key as string];
        }
      });
    }

    return (
      <ComponentWithClassName
        className={cn(variants(props), className)}
        ref={ref}
        {...(rest as any)}
      />
    );
  });
}
