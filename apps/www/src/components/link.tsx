import * as React from 'react';

import { cn } from '@udecode/cn';
import { ArrowUpRight } from 'lucide-react';
import LinkPrimitive from 'next/link';

import { Icons } from '@/components/icons';

export function Link({
  className,
  ...props
}: React.ComponentProps<typeof LinkPrimitive>) {
  const isExternal =
    typeof props.href === 'string' && props.href.startsWith('http');

  const isSection = props['aria-label'] === 'Link to section';

  return (
    <LinkPrimitive
      className={cn(
        'relative inline-block h-5 font-medium',
        !isExternal && 'underline underline-offset-4',
        isExternal &&
          'no-underline hover:after:absolute hover:after:-bottom-1 hover:after:left-0 hover:after:h-[1.5px] hover:after:w-[calc(100%-2px)] hover:after:bg-primary',
        // 'relative font-medium text-blue-600 hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:h-[1.5px] hover:after:w-[calc(100%-2px)] hover:after:bg-brand',
        className
      )}
      target={isExternal ? '_blank' : undefined}
      {...props}
    >
      {isSection && (
        <div className="absolute top-1.5 -left-5 leading-none opacity-0 group-hover:opacity-100 hover:opacity-100">
          <Icons.pragma className="size-4 text-muted-foreground" />
        </div>
      )}

      {props.children}
      {isExternal && (
        <span className="inline-flex group-data-[empty=true]/subheading:hidden">
          <ArrowUpRight className="size-[14px]" />
        </span>
      )}
    </LinkPrimitive>
  );
}
