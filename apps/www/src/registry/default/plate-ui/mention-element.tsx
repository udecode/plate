import React from 'react';
import { getHandler, PlateElement, useElement } from '@udecode/plate-common';
import { TMentionElement } from '@udecode/plate-mention';
import { useFocused, useSelected } from 'slate-react';

import { cn, extendProps } from '@/lib/utils';

export const MentionElement = extendProps(PlateElement)<{
  prefix?: string;
  onClick?: (mentionNode: any) => void;
  renderLabel?: (mentionable: TMentionElement) => string;
}>(({ children, prefix, renderLabel, className, onClick, ...props }, ref) => {
  const element = useElement<TMentionElement>();
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      ref={ref}
      className={cn(
        'inline-block cursor-pointer rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium',
        selected && focused && 'ring-2 ring-ring',
        element.children[0].bold === true && 'font-bold',
        element.children[0].italic === true && 'italic',
        element.children[0].underline === true && 'underline',
        className
      )}
      data-slate-value={element.value}
      contentEditable={false}
      onClick={getHandler(onClick, element)}
      {...props}
    >
      {prefix}
      {renderLabel ? renderLabel(element) : element.value}
      {children}
    </PlateElement>
  );
});
