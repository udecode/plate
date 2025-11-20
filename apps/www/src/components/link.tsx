import * as React from 'react';

import { ArrowUpRight } from 'lucide-react';
import LinkPrimitive from 'next/link';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export function Link({
  className,
  showArrow,
  ...props
}: React.ComponentProps<typeof LinkPrimitive> & {
  showArrow?: boolean;
}) {
  const isExternal =
    typeof props.href === 'string' && props.href.startsWith('http');

  const isSection = props['aria-label'] === 'Link to section';

  return (
    <LinkPrimitive
      className={cn(
        'relative inline-block h-5 font-medium text-foreground',
        !isExternal && 'underline underline-offset-4',
        isExternal &&
          'hover:after:-bottom-1 no-underline hover:after:absolute hover:after:left-0 hover:after:h-[1.5px] hover:after:w-[calc(100%-2px)] hover:after:bg-primary',
        // 'relative font-medium text-blue-600 hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:h-[1.5px] hover:after:w-[calc(100%-2px)] hover:after:bg-brand',
        className
      )}
      data-slot="mdx-link"
      target={isExternal ? '_blank' : undefined}
      {...props}
    >
      {isSection && (
        <div className="-left-5 absolute top-1.5 leading-none opacity-0 hover:opacity-100 group-hover:opacity-100">
          <Icons.pragma className="size-4 text-muted-foreground" />
        </div>
      )}

      {props.children}
      {(isExternal || showArrow) && (
        <span className="inline-flex group-data-[empty=true]/subheading:hidden">
          <ArrowUpRight className="size-[14px]" />
        </span>
      )}
    </LinkPrimitive>
  );
}
