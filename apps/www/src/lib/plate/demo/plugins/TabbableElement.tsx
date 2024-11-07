import React, { type CSSProperties } from 'react';

import type { PlateElementProps } from '@udecode/plate-common/react';

import { useFocused, useSelected } from 'slate-react';

import { PlateElement } from '@/registry/default/plate-ui/plate-element';

const boxStyle: CSSProperties = {
  marginBottom: '8px',
  padding: '8px',
};

const unselectedBoxStyle: CSSProperties = {
  ...boxStyle,
  border: '1px solid #ccc',
};

const selectedBoxStyle: CSSProperties = {
  ...boxStyle,
  border: '2px solid blue',
};

export function TabbableElement({ children, ...props }: PlateElementProps) {
  const selected = useSelected();
  const focused = useFocused();

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <PlateElement {...props}>
      <div
        style={selected && focused ? selectedBoxStyle : unselectedBoxStyle}
        contentEditable={false}
      >
        <p>This is a void element.</p>
        <button type="button">Button 1</button>{' '}
        <button type="button">Button 2</button>
      </div>
      {children}
    </PlateElement>
  );
}
