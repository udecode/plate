import React from 'react';
import { getHandler, Value } from '@udecode/plate-common';
import { TMentionElement } from '@udecode/plate-mention';
import {
  cn,
  PlateElement,
  PlateElementProps,
} from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';

export interface MentionElementProps
  extends PlateElementProps<Value, TMentionElement> {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: any) => void;
  renderLabel?: (mentionable: TMentionElement) => string;
}

export function MentionElement({
  prefix,
  renderLabel,
  className,
  onClick,
  ...props
}: MentionElementProps) {
  const { children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      className={cn(
        'mx-px my-0 inline-block rounded-[4px] bg-[#eee] p-[3px] pb-0.5 align-baseline text-[0.9em]',
        selected && focused && 'shadow-[0_0_0_2px_#B4D5FF]',
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
}
