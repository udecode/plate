import React from 'react';
import Tippy from '@tippyjs/react';
import tw, { css } from 'twin.macro';
import { ColorInput } from './ColorInput';

const DEFAULT_COLORS = [
  {
    name: 'red',
    value: '#ffff',
    isBrightColor: false,
  },
  {
    name: 'green',
    value: 'green',
    isBrightColor: false,
  },
  {
    name: 'blue',
    value: 'blue',
    isBrightColor: false,
  },
  {
    name: 'yellow',
    value: 'yellow',
    isBrightColor: true,
  },
  {
    name: 'red-2',
    value: 'red',
    isBrightColor: false,
  },
  {
    name: 'green-2',
    value: 'green',
    isBrightColor: false,
  },
  {
    name: 'blue-2',
    value: 'blue',
    isBrightColor: false,
  },
  {
    name: 'yellow-2',
    value: 'yellow',
    isBrightColor: false,
  },
  {
    name: 'gray-2',
    value: 'gray',
    isBrightColor: false,
  },
  {
    name: 'white',
    value: 'white',
    isBrightColor: true,
  },
  {
    name: 'blue',
    value: 'blue',
    isBrightColor: false,
  },
  {
    name: 'yellow',
    value: 'yellow',
    isBrightColor: true,
  },
  {
    name: 'red-2',
    value: 'red',
    isBrightColor: false,
  },
  {
    name: 'green-2',
    value: 'green',
    isBrightColor: false,
  },
  {
    name: 'blue-2',
    value: 'blue',
    isBrightColor: false,
  },
  {
    name: 'yellow-2',
    value: 'yellow',
    isBrightColor: false,
  },
];

const CUSTOM_COLORS = [
  {
    name: 'red',
    value: 'red',
    isBrightColor: false,
  },
  {
    name: 'green',
    value: 'green',
    isBrightColor: false,
  },
  {
    name: 'blue',
    value: 'blue',
    isBrightColor: false,
  },
  {
    name: 'yellow',
    value: 'yellow',
    isBrightColor: true,
  },
  {
    name: 'red-2',
    value: 'red',
    isBrightColor: false,
  },
  {
    name: 'green-2',
    value: 'green',
    isBrightColor: false,
  },
  {
    name: 'blue-2',
    value: 'blue',
    isBrightColor: false,
  },
  {
    name: 'yellow-2',
    value: 'yellow',
    isBrightColor: false,
  },
];

type ColorProps = {
  name?: string;
  value: string;
  isBrightColor: boolean;
  isSelected: boolean;
  updateColor: (ev: any, colorObj: string) => void;
};

const Color = ({
  name,
  value,
  isBrightColor,
  isSelected,
  updateColor,
}: ColorProps) => {
  const content = (
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
        isBrightColor && tw`border-2 border-gray-300 border-solid`,
        // TODO add a checkmark to better indicate selected colors
        isSelected && tw`border-4 border-green-800 border-solid`,
      ]}
    />
  );

  return name ? <Tippy content={name}>{content}</Tippy> : content;
};

type CustomColorsProps = {
  color: string | undefined;
  updateColor: (ev: any, colorObj: string) => void;
};

const CustomColors = ({ color, updateColor }: CustomColorsProps) => {
  const colors =
    !color || CUSTOM_COLORS.some((customColor) => customColor.value === color)
      ? CUSTOM_COLORS
      : [
          ...CUSTOM_COLORS,
          {
            name: '',
            value: color,
            isBrightColor: false,
          },
        ].splice(-8);
  return (
    <div>
      <ColorInput
        value={color || '#000000'}
        onChange={(ev) => updateColor(ev, ev.target.value)}
      >
        <button
          type="button"
          css={tw`mb-2 w-full bg-transparent hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 border-none rounded cursor-pointer`}
        >
          CUSTOM
        </button>
      </ColorInput>

      <div
        css={[
          tw`mb-2`,
          css`
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 0.25rem;
            padding: 0.5em;
          `,
        ]}
      >
        {colors.map(({ name, value, isBrightColor }) => (
          <Color
            key={name}
            name={name}
            value={value}
            isBrightColor={isBrightColor}
            isSelected={color === value}
            updateColor={updateColor}
          />
        ))}
      </div>

      <div css={tw`border border-gray-200 border-solid mb-2`} />
    </div>
  );
};

type ColorPickerProps = {
  color: string | undefined;
  updateColor: (ev: any, colorObj: string) => void;
};

export const ColorPicker = ({ color, updateColor }: ColorPickerProps) => {
  return (
    <div css={tw`p-2`}>
      <CustomColors color={color} updateColor={updateColor} />

      <div
        css={css`
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 0.25rem;
          padding: 0.5em;
        `}
      >
        {DEFAULT_COLORS.map(({ name, value, isBrightColor }) => (
          <Color
            key={name}
            name={name}
            value={value}
            isBrightColor={isBrightColor}
            isSelected={color === value}
            updateColor={updateColor}
          />
        ))}
      </div>
    </div>
  );
};
