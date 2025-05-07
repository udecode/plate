import React from 'react';

import type { SlateRenderElementProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { CheckIcon } from 'lucide-react';

export const TodoMarkerStatic = ({
  element,
}: Omit<SlateRenderElementProps, 'children'>) => {
  return (
    <div contentEditable={false}>
      <CheckboxStatic
        className="pointer-events-none absolute top-1 -left-6"
        checked={element.checked as boolean}
      />
    </div>
  );
};

export const TodoLiStatic = ({
  children,
  element,
}: SlateRenderElementProps) => {
  return (
    <li
      className={cn(
        'list-none',
        (element.checked as boolean) && 'text-muted-foreground line-through'
      )}
    >
      {children}
    </li>
  );
};

function CheckboxStatic({
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
