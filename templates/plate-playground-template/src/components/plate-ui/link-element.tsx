import React from 'react';
import { cn } from '@udecode/cn';
import { PlateElement, PlateElementProps, Value } from '@udecode/plate-common';
import { TLinkElement, useLink } from '@udecode/plate-link';

const LinkElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps<Value, TLinkElement>
>(({ className, children, ...props }, ref) => {
  const { props: linkProps } = useLink({ element: props.element });

  return (
    <PlateElement
      asChild
      ref={ref}
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        className
      )}
      {...linkProps}
      {...(props as any)}
    >
      <a>{children}</a>
    </PlateElement>
  );
});
LinkElement.displayName = 'LinkElement';

export { LinkElement };
