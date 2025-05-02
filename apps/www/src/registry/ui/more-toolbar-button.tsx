import { cn } from '@udecode/cn';
import { MoreHorizontalIcon } from 'lucide-react';

import { buttonVariants } from './button';
import { withTooltip } from './tooltip';

export const MoreToolbarButton = withTooltip(function MoreToolbarButton({
  className,
  pressed,
  ...props
}: {
  pressed: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        pressed && 'bg-muted text-muted-foreground',
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
    </span>
  );
});
