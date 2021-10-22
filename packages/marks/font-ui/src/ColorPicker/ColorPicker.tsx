import React, { ReactNode } from 'react';
import Tippy from '@tippyjs/react';
import tw, { css } from 'twin.macro';
import { ColorInput } from './ColorInput';
import { ColorType, DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './colors';

type ColorProps = {
  name?: string;
  value: string;
  isBrightColor: boolean;
  isSelected: boolean;
  selectedIcon: ReactNode;
  updateColor: (ev: any, colorObj: string) => void;
};

const Color = ({
  name,
  value,
  isBrightColor,
  isSelected,
  selectedIcon,
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
        tw`border-2 border-gray-300 border-solid`,
        !isBrightColor && tw`border-transparent text-white`,
      ]}
    >
      {isSelected ? selectedIcon : null}
    </button>
  );

  return name ? <Tippy content={name}>{content}</Tippy> : content;
};

type CustomColorsProps = {
  color: string | undefined;
  colors: ColorType[];
  customColors: ColorType[];
  selectedIcon: ReactNode;
  updateColor: (ev: any, colorObj: string) => void;
};

const CustomColors = ({
  color,
  colors,
  customColors,
  selectedIcon,
  updateColor,
}: CustomColorsProps) => {
  const computedColors =
    !color || customColors.some((customColor) => customColor.value === color)
      ? customColors
      : [
          ...customColors,
          colors.find((col) => col.value === color) || {
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
          css={tw`w-full bg-transparent hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 border-none rounded cursor-pointer`}
        >
          CUSTOM
        </button>
      </ColorInput>

      {computedColors.length ? (
        <div
          css={[
            tw`my-2`,
            css`
              display: grid;
              grid-template-columns: repeat(10, 1fr);
              gap: 0.25rem;
              padding: 0.5em;
            `,
          ]}
        >
          {computedColors.map(({ name, value, isBrightColor }) => (
            <Color
              key={name || value}
              name={name}
              value={value}
              isBrightColor={isBrightColor}
              isSelected={color === value}
              selectedIcon={selectedIcon}
              updateColor={updateColor}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

type ColorsProps = {
  color: string | undefined;
  colors: ColorType[];
  selectedIcon: ReactNode;
  updateColor: (ev: any, colorObj: string) => void;
};

const Colors = ({ color, colors, selectedIcon, updateColor }: ColorsProps) => {
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
          selectedIcon={selectedIcon}
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
  selectedIcon: ReactNode;
  updateColor: (ev: any, colorObj: string) => void;
};

export const ColorPicker = ({
  color,
  colors = DEFAULT_COLORS,
  customColors = DEFAULT_CUSTOM_COLORS,
  selectedIcon,
  updateColor,
}: ColorPickerProps) => {
  return (
    <div css={tw`p-2`}>
      <CustomColors
        color={color}
        colors={colors}
        customColors={customColors}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
      />
      <div css={tw`border border-gray-200 border-solid my-2`} />
      <Colors
        color={color}
        colors={colors}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
      />
    </div>
  );
};
