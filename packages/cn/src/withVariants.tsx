import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from './cn';

/**
 * Set default `className` with `cn` and `variants`.
 * @param Component
 * @param variants - Variants from `cva`. `Component` props will be extended with `variants` props.
 * @param onlyVariantsProps - Props to exclude from `Component` props. Set the props that are only used for variants.
 */
export function withVariants<
  T extends keyof HTMLElementTagNameMap | React.ComponentType<object>,
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
        ref={ref}
        className={cn(variants(props), className)}
        {...(rest as any)}
      />
    );
  });
}
