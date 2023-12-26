import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ComponentType,
  createElement,
  ElementRef,
  forwardRef,
  ForwardRefRenderFunction,
  FunctionComponent,
} from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withProps<T extends { className?: string }>(
  Component: FunctionComponent<T>,
  defaultProps: Partial<T>
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

export function withCn<T extends { className?: string }>(
  Component: FunctionComponent<T>,
  className: string
) {
  return withProps<T>(Component, { className } as any);
}

export function withRef<
  T extends keyof HTMLElementTagNameMap | ComponentType<object>,
>(RenderFunction: (props: ComponentPropsWithRef<T>) => JSX.Element) {
  return forwardRef<ElementRef<T>, ComponentPropsWithRef<T>>(
    function ExtendComponent(props, ref) {
      return <RenderFunction ref={ref} {...props} />;
    }
  );
}

export function extendProps<E>(Component: FunctionComponent<E>) {
  return function extended<T>(
    renderFunction: ForwardRefRenderFunction<
      ElementRef<typeof Component>,
      ComponentPropsWithoutRef<typeof Component> & T
    >
  ) {
    return forwardRef<
      ElementRef<typeof Component>,
      ComponentPropsWithoutRef<typeof Component> & T
    >(renderFunction);
  };
}

export function extendElementProps<E extends keyof HTMLElementTagNameMap>(
  element: E
) {
  return function extended<T>(
    renderFunction: ForwardRefRenderFunction<
      ElementRef<typeof element>,
      ComponentPropsWithoutRef<typeof element> & T
    >
  ) {
    return forwardRef<
      ElementRef<typeof element>,
      ComponentPropsWithoutRef<typeof element> & T
    >(renderFunction);
  };
}

export function withVariants<
  T extends { className?: string },
  V extends ReturnType<typeof cva>,
>(
  Component: FunctionComponent<T>,
  variants: V,
  onlyVariantsProps?: (keyof VariantProps<V>)[]
) {
  return forwardRef<ElementRef<typeof Component>, T & VariantProps<V>>(
    function ExtendComponent({ className, ...props }, ref) {
      const rest = { ...props };

      if (onlyVariantsProps) {
        onlyVariantsProps.forEach((key) => {
          if (props[key as string] !== undefined) {
            delete rest[key as string];
          }
        });
      }

      return (
        <Component
          ref={ref}
          className={cn(variants(props), className)}
          {...(rest as any)}
        />
      );
    }
  );
}

export function createElementWithRef<T extends keyof HTMLElementTagNameMap>(
  tag: T
) {
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
