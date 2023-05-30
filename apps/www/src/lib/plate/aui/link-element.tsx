import React from 'react';
import { Link, LinkRootProps } from '@udecode/plate-link';
import { cn } from '@udecode/plate-tailwind';

// REVIEWW
const LinkElement = React.forwardRef<
  React.ElementRef<typeof Link.Root>,
  LinkRootProps
>(({ className, ...props }, ref) => {
  return (
    <Link.Root
      ref={ref}
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
});

LinkElement.displayName = 'LinkElement';

export { LinkElement };
