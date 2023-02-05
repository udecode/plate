import React, { CSSProperties } from 'react';
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

export const TabbableElement = ({
  attributes,
  children,
}: PlateRenderElementProps<MyValue, TElement>) => {
  const selected = useSelected() & useFocused();

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <div style={selected ? selectedBoxStyle : unselectedBoxStyle}>
        <p>This is a void element.</p>
        <button type="button">Button 1</button>{' '}
        <button type="button">Button 2</button>
      </div>
      {children}
    </div>
  );
};
