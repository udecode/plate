import React from 'react';
import Tippy from '@tippyjs/react';
import tw, { css } from 'twin.macro';
import { ColorInput } from './ColorInput';
import { ColorType, DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './colors';

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
  customColors: ColorType[];
  updateColor: (ev: any, colorObj: string) => void;
};

const CustomColors = ({
  color,
  customColors,
  updateColor,
}: CustomColorsProps) => {
  const colors =
    !color || customColors.some((customColor) => customColor.value === color)
      ? customColors
      : [
          ...customColors,
          {
            name: '',
            value: color,
            isBrightColor: false,
          },
        ].splice(-10);

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
            grid-template-columns: repeat(10, 1fr);
            gap: 0.25rem;
            padding: 0.5em;
          `,
        ]}
      >
        {colors.map(({ name, value, isBrightColor }) => (
          <Color
            key={name || value}
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

type ColorsProps = {
  color: string | undefined;
  colors: ColorType[];
  updateColor: (ev: any, colorObj: string) => void;
};

const Colors = ({ color, colors, updateColor }: ColorsProps) => {
  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 0.25rem;
        padding: 0.5em;
      `}
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
  );
};

type ColorPickerProps = {
  color?: string;
  colors?: ColorType[];
  customColors?: ColorType[];
  updateColor: (ev: any, colorObj: string) => void;
};

export const ColorPicker = ({
  color,
  colors = DEFAULT_COLORS,
  customColors = DEFAULT_CUSTOM_COLORS,
  updateColor,
}: ColorPickerProps) => {
  return (
    <div css={tw`p-2`}>
      <CustomColors
        color={color}
        customColors={customColors}
        updateColor={updateColor}
      />
      <div css={tw`border border-gray-200 border-solid mb-2`} />
      <Colors color={color} colors={colors} updateColor={updateColor} />
    </div>
  );
};
