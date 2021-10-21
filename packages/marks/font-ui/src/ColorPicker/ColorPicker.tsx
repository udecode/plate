import React from 'react';
import Tippy from '@tippyjs/react'; // optional
import tw, { css } from 'twin.macro';

const DEFAULT_COLORS = [
  {
    name: 'red',
    value: 'red',
    isLightColor: false,
  },
  {
    name: 'green',
    value: 'green',
    isLightColor: false,
  },
  {
    name: 'blue',
    value: 'blue',
    isLightColor: false,
  },
  {
    name: 'yellow',
    value: 'yellow',
    isLightColor: false,
  },
  {
    name: 'red-2',
    value: 'red',
    isLightColor: false,
  },
  {
    name: 'green-2',
    value: 'green',
    isLightColor: false,
  },
  {
    name: 'blue-2',
    value: 'blue',
    isLightColor: false,
  },
  {
    name: 'yellow-2',
    value: 'yellow',
    isLightColor: false,
  },
  {
    name: 'gray-2',
    value: 'gray',
    isLightColor: false,
  },
  {
    name: 'white',
    value: 'white',
    isLightColor: true,
  },
];

type ColorPickerProps = {
  color: string | undefined;
  updateColor: (ev: any, colorObj: string) => void;
};

export const ColorPicker = ({ color, updateColor }: ColorPickerProps) => {
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 0.25rem;
        padding: 0.5em;
      `}
    >
      {DEFAULT_COLORS.map(({ name, value, isLightColor }) => (
        <Tippy content={name}>
          <button
            key={name}
            type="button"
            aria-label={name}
            onClick={(ev) => updateColor(ev, value)}
            css={[
              tw`cursor-pointer h-8 w-8 border-0 rounded-full`,
              css`
                background-color: ${value};

                :hover {
                  box-shadow: 0px 0px 5px 1px #9a9a9a;
                }
                :focus {
                  box-shadow: 0px 0px 5px 1px #676767;
                }
              `,
              isLightColor && tw`border-2 border-gray-300 border-solid`,
              // TODO add a checkmark
              color === value && tw`border-4 border-green-800 border-solid`,
            ]}
          />
        </Tippy>
      ))}
      {/* <input
        type="color"
        onChange={(ev) => updateColor(ev, ev.target.value)}
        value={color || '#000000'}
      /> */}
    </div>
  );
};
