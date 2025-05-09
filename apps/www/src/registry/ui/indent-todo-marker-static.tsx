import * as React from 'react';

import type { SlateRenderElementProps } from '@udecode/plate';

import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function TodoMarkerStatic(
  props: Omit<SlateRenderElementProps, 'children'>
) {
  return (
    <div contentEditable={false}>
      <CheckboxStatic
        className="pointer-events-none absolute top-1 -left-6"
        checked={props.element.checked as boolean}
      />
    </div>
  );
}

export function TodoLiStatic(props: SlateRenderElementProps) {
  return (
    <li
      className={cn(
        'list-none',
        (props.element.checked as boolean) &&
          'text-muted-foreground line-through'
      )}
    >
      {props.children}
    </li>
  );
}

type CheckboxStaticProps = {
  checked: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function CheckboxStatic(props: CheckboxStaticProps) {
  return (
    <button
      className={cn(
        'peer size-4 shrink-0 rounded-sm border border-primary bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        props.className
      )}
      style={props.style}
      data-state={props.checked ? 'checked' : 'unchecked'}
      type="button"
    >
      <div className={cn('flex items-center justify-center text-current')}>
        {props.checked && <CheckIcon className="size-4" />}
      </div>
    </button>
  );
}
