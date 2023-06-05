import React from 'react';
import { PlateElement, TLinkElement, useLink } from '@udecode/plate';
import { PlateElementProps, Value } from '@udecode/plate-common';

import { cn } from '@/lib/utils';

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
        'text-[#0078d4] no-underline',
        'hover:text-[#004578] hover:underline',
        'visited:hover:text-[#004578] visited:hover:underline',
        'visited:text-[#0078d4]',
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
