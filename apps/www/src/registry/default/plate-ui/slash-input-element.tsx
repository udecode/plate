import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement, getHandler } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

export const SlashInputElement = withRef<
  typeof PlateElement,
  {
    onClick?: (slashNode: any) => void;
  }
>(({ className, onClick, ...props }, ref) => {
  const { children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      asChild
      className={cn(
        'inline-block rounded-md px-1.5 py-0.5 align-baseline text-sm',
        selected && focused && 'ring-2 ring-ring',
        className
      )}
      data-slate-value={element.value}
      onClick={getHandler(onClick, element)}
      ref={ref}
      {...props}
    >
      <span>/{children}</span>
    </PlateElement>
  );
});
