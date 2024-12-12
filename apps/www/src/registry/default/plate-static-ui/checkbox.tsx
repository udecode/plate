import * as React from 'react';

import { cn } from '@udecode/cn';
import { Check } from 'lucide-react';

export function StaticCheckbox({
  className,
  ...props
}: {
  checked: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      className={cn(
        'peer size-4 shrink-0 rounded-sm border border-primary bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
      disabled
      data-state={props.checked ? 'checked' : 'unchecked'}
      type="button"
      {...props}
    >
      <div className={cn('flex items-center justify-center text-current')}>
        {props.checked && <Check className="size-4" />}
      </div>
    </button>
  );
}
