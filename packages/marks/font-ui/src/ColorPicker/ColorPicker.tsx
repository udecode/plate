import React from 'react';
import tw from 'twin.macro';

export const ColorPicker = ({
  color,
  updateColor,
}: {
  color: string | undefined;
  updateColor: (ev: any, colorObj: string) => void;
}) => {
  return (
    <div css={tw`flex`}>
      <input
        type="color"
        onChange={(ev) => updateColor(ev, ev.target.value)}
        value={color || '#000000'}
      />
    </div>
  );
};
