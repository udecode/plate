import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { useElement } from '@udecode/plate-common/react';
import { useLink } from '@udecode/plate-link/react';

import { PlateElement } from './plate-element';

import type { TLinkElement } from '@udecode/plate-link';

export const LinkElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = useElement<TLinkElement>();
    const { props: linkProps } = useLink({ element });

    return (
      <PlateElement
        ref={ref}
        as="a"
        className={cn(
          'font-medium text-primary underline decoration-primary underline-offset-4',
          className
        )}
        {...(linkProps as any)}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
