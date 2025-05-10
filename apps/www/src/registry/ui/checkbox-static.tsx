import * as React from 'react';

import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function CheckboxStatic({
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
        'peer size-4 shrink-0 rounded-sm border border-primary bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
      data-state={props.checked ? 'checked' : 'unchecked'}
      type="button"
      {...props}
    >
      <div className={cn('flex items-center justify-center text-current')}>
        {props.checked && <CheckIcon className="size-4" />}
      </div>
    </button>
  );
}
