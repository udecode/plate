import React, { CSSProperties } from 'react';
import { PlateElementProps } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

const boxStyle: CSSProperties = {
  padding: '8px',
  marginBottom: '8px',
};

const unselectedBoxStyle: CSSProperties = {
  ...boxStyle,
  border: '1px solid #ccc',
};

const selectedBoxStyle: CSSProperties = {
  ...boxStyle,
  border: '2px solid blue',
};

export function TabbableElement({ attributes, children }: PlateElementProps) {
  const selected = useSelected();
  const focused = useFocused();

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <div style={selected && focused ? selectedBoxStyle : unselectedBoxStyle}>
        <p>This is a void element.</p>
        <button type="button">Button 1</button>{' '}
        <button type="button">Button 2</button>
      </div>
      {children}
    </div>
  );
}
