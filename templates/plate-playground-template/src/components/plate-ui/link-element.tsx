'use client';

import React from 'react';

import type { TLinkElement } from '@udecode/plate-link';

import { cn, withRef } from '@udecode/cn';
import { useLink } from '@udecode/plate-link/react';
import { PlateElement } from '@udecode/plate/react';

export const LinkElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = props.element as TLinkElement;
    const { props: linkProps } = useLink({ element });

    return (
      <PlateElement
        ref={ref}
        as="a"
        className={cn(
          className,
          'font-medium text-primary underline decoration-primary underline-offset-4'
        )}
        {...(linkProps as any)}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
