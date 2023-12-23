import {
  createElement,
  ElementRef,
  forwardRef,
  ForwardRefExoticComponent,
} from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extend<T extends { className?: string }>(
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
