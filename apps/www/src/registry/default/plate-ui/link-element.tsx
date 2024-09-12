import React from 'react';

import type { TLinkElement } from '@udecode/plate-link';

import { cn, withRef } from '@udecode/cn';
import { PlateElement, useElement } from '@udecode/plate-common/react';
import { useLink } from '@udecode/plate-link/react';

export const LinkElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = useElement<TLinkElement>();
    const { props: linkProps } = useLink({ element });

    return (
      <PlateElement
        ref={ref}
        asChild
        className={cn(
          'font-medium text-primary underline decoration-primary underline-offset-4',
          className
        )}
        {...(linkProps as any)}
        {...props}
      >
        <a>{children}</a>
      </PlateElement>
    );
  }
);
