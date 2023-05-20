import React from 'react';
import { Link, LinkRootProps } from '@udecode/plate-link';
import { cn } from '@udecode/plate-tailwind';

export function LinkElement({ className, ...props }: LinkRootProps) {
  return (
    <Link.Root
      className={cn(
        'text-[#0078d4] no-underline',
        'hover:text-[#004578] hover:underline',
        'visited:hover:text-[#004578] visited:hover:underline',
        'visited:text-[#0078d4]',
        className
      )}
      {...props}
    />
  );
}
