import React from 'react';
import { useFocused, useSelected } from 'slate-react';
import { MentionableItem, MentionRenderElementProps } from '../types';

export const getMentionElement = (
  onClick?: (mentionable: MentionableItem) => void
) => {
  return ({ attributes, children, element }: MentionRenderElementProps) => {
    const selected = useSelected();
    const focused = useFocused();

    return (
      <span
        {...attributes}
        onClick={onClick ? () => onClick(element.mentionable) : undefined}
        data-slate-character={element.mentionable.value}
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
        {element.prefix}
        {element.mentionable.value}
        {children}
      </span>
    );
  };
};
