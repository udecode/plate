import * as React from 'react';

import { cn } from '@udecode/cn';
import { ArrowUpRight } from 'lucide-react';
import LinkPrimitive from 'next/link';

export function Link({
  className,
  ...props
}: React.ComponentProps<typeof LinkPrimitive>) {
  const isExternal =
    typeof props.href === 'string' && props.href.startsWith('http');

  return (
    <LinkPrimitive
      className={cn(
        'relative font-medium',
        !isExternal && 'underline underline-offset-4',
        isExternal &&
          'no-underline hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:h-[1.5px] hover:after:w-[calc(100%-2px)] hover:after:bg-primary',
        // 'relative font-medium text-blue-600 hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:h-[1.5px] hover:after:w-[calc(100%-2px)] hover:after:bg-brand',
        className
      )}
      target={isExternal ? '_blank' : undefined}
      {...props}
    >
      {props.children}
      {isExternal && (
        <span className="inline-flex group-data-[empty=true]/subheading:hidden">
          <ArrowUpRight className="size-[14px]" />
        </span>
      )}
    </LinkPrimitive>
  );
}
