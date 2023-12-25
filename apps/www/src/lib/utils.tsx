import {
  createElement,
  ElementRef,
  forwardRef,
  ForwardRefExoticComponent,
} from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withProps<T extends { className?: string }>(
  Component: ForwardRefExoticComponent<T>,
  defaultProps: T
) {
  return forwardRef<ElementRef<typeof Component>, T>(
    function ExtendComponent(props, ref) {
      return (
        <Component
          ref={ref}
          {...defaultProps}
          {...props}
          className={cn(defaultProps.className, props.className)}
        />
      );
    }
  );
}

export function withVariants<
  T extends { className?: string },
  V extends ReturnType<typeof cva>,
>(
  Component: ForwardRefExoticComponent<T>,
  variants: V,
  onlyVariantsProps?: (keyof VariantProps<V>)[]
) {
  return forwardRef<ElementRef<typeof Component>, T & VariantProps<V>>(
    function ExtendComponent(props, ref) {
      const variantProps = {} as VariantProps<V>;

      if (onlyVariantsProps) {
        Object.keys(onlyVariantsProps).forEach((key) => {
          variantProps[key] = props[key];
          delete props[key];
        });
      }

      return (
        <Component
          ref={ref}
          {...props}
          className={cn(variants(variantProps), props.className)}
        />
      );
    }
  );
}

export function create<T extends keyof HTMLElementTagNameMap>(tag: T) {
  return forwardRef<HTMLElementTagNameMap[T], JSX.IntrinsicElements[T]>(
    function CreateComponent(props, ref) {
      return createElement(tag, { ...props, ref });
    }
  );
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
