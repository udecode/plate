import * as React from 'react';
import { useFocused, useSelected } from 'slate-react';
import { getHandler } from '../../../common/utils';
import { MentionRenderElementProps } from '../types';

export const MentionElement = ({
  attributes,
  children,
  element,
  prefix,
  onClick,
}: MentionRenderElementProps) => {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <span
      {...attributes}
      data-slate-value={element.value}
      contentEditable={false}
      style={{
        padding: '3px 3px 2px',
        margin: '0 1px',
        verticalAlign: 'baseline',
        display: 'inline-block',
        borderRadius: '4px',
        backgroundColor: '#eee',
        fontSize: '0.9em',
        boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
      }}
      onClick={getHandler(onClick, { value: element.value })}
    >
      {prefix}
      {element.value}
      {children}
    </span>
  );
};
