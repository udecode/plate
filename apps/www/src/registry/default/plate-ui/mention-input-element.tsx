import React from 'react';
import { getHandler, PlateElement } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

import { cn, extendProps } from '@/lib/utils';

export const MentionInputElement = extendProps(PlateElement)<{
  onClick?: (mentionNode: any) => void;
}>(({ className, onClick, ...props }, ref) => {
  const { children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      ref={ref}
      asChild
      data-slate-value={element.value}
      className={cn(
        'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm',
        selected && focused && 'ring-2 ring-ring',
        className
      )}
      onClick={getHandler(onClick, element)}
      {...props}
    >
      <span>{children}</span>
    </PlateElement>
  );
});
