import React from 'react';
import { PlateElement } from '@udecode/plate';
import { getHandler, PlateElementProps, Value } from '@udecode/plate-common';
import { TMentionElement } from '@udecode/plate-mention';
import { useFocused, useSelected } from 'slate-react';

import { cn } from '@/lib/utils';

export interface MentionInputElementProps
  extends PlateElementProps<Value, TMentionElement> {
  onClick?: (mentionNode: any) => void;
}

const MentionInputElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  MentionInputElementProps
>(({ className, onClick, ...props }, ref) => {
  const { children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      asChild
      ref={ref}
      data-slate-value={element.value}
      className={cn(
        'mx-px my-0 inline-block rounded-[4px] bg-[#eee] p-[3px] pb-2 align-baseline text-[0.9em]',
        selected && focused && 'shadow-[0_0_0_2px_#B4D5FF]',
        className
      )}
      onClick={getHandler(onClick, element)}
      {...props}
    >
      <span>{children}</span>
    </PlateElement>
  );
});
MentionInputElement.displayName = 'MentionInputElement';

export { MentionInputElement };
