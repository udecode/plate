import * as React from 'react';

export const ColorPicker = ({
  color,
  updateColor,
}: {
  color: string | undefined;
  updateColor: (ev: any, colorObj: string) => void;
}) => {
  return (
    <div style={{ display: 'flex' }}>
      <input
        type="color"
        onChange={(ev) => updateColor(ev, ev.target.value)}
        value={color || '#000000'}
      />
    </div>
  );
};
