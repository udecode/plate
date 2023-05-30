import React from 'react';
import { getHandler, Value } from '@udecode/plate-common';
import { TMentionElement } from '@udecode/plate-mention';
import { cn, PlateElement, PlateElementProps } from '@udecode/plate-tailwind';
import { useFocused, useSelected } from 'slate-react';

// REVIEWW
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
      ref={ref}
      as="span"
      data-slate-value={element.value}
      className={cn(
        'mx-px my-0 inline-block rounded-[4px] bg-[#eee] p-[3px] pb-2 align-baseline text-[0.9em]',
        selected && focused && 'shadow-[0_0_0_2px_#B4D5FF]',
        className
      )}
      onClick={getHandler(onClick, element)}
      {...props}
    >
      {children}
    </PlateElement>
  );
});

MentionInputElement.displayName = 'MentionInputElement';

export { MentionInputElement };
