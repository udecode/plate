import React from 'react';
import { getHandler, Value } from '@udecode/plate-common';
import { TMentionElement } from '@udecode/plate-mention';
import {
  cn,
  PlateElement,
  PlateElementProps,
} from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';

export interface MentionInputElementProps
  extends PlateElementProps<Value, TMentionElement> {
  onClick?: (mentionNode: any) => void;
}

export function MentionInputElement({
  className,
  onClick,
  ...props
}: MentionInputElementProps) {
  const { children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
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
}
