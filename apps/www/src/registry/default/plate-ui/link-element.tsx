import React from 'react';
import { PlateElement, useElement } from '@udecode/plate-common';
import { TLinkElement, useLink } from '@udecode/plate-link';

import { cn, withRef } from '@/lib/utils';

export const LinkElement = withRef(
  PlateElement,
  ({ className, children, ...props }) => {
    const element = useElement<TLinkElement>();
    const { props: linkProps } = useLink({ element });

    return (
      <PlateElement
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
