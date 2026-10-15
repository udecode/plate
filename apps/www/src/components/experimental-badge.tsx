import type * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ExperimentalBadge({
  className,
  compact,
  ...props
}: React.ComponentProps<typeof Badge> & { compact?: boolean }) {
  return (
    <Badge
      className={cn(
        'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        compact && 'h-4 rounded-sm px-1 py-0 text-[10px] leading-none',
        className
      )}
      data-experimental-badge
      title="Experimental: the API may change in any release"
      variant="outline"
      {...props}
    >
      Experimental
    </Badge>
  );
}
