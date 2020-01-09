import React from 'react';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import { MENTION } from '../types';

export const MentionElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <span
      {...attributes}
      data-slate-type={MENTION}
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
    >
      @{element.character}
      {children}
    </span>
  );
};
