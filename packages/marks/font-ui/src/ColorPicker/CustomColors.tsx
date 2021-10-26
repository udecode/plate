import React, { ReactNode, useCallback, useState } from 'react';
import { Button } from '@udecode/plate-ui-button';
import debounce from 'lodash/debounce';
import tw from 'twin.macro';
import { ColorInput } from './ColorInput';
import { Colors } from './Colors';
import { ColorType } from './defaults';

type CustomColorsProps = {
  color?: string;
  colors: ColorType[];
  customColors: ColorType[];
  selectedIcon: ReactNode;
  updateColor: (ev: any, colorObj: string) => void;
};

export const CustomColors = ({
  color,
  colors,
  customColors,
  selectedIcon,
  updateColor,
}: CustomColorsProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateColorDebounced = useCallback(
    debounce(
      (ev: React.ChangeEvent<HTMLInputElement>) =>
        updateColor(ev, ev.target.value),
      100
    ),
    [updateColor]
  );

  const [value, setValue] = useState<string>(color || '#000000');

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
        ];

  return (
    <div>
      <ColorInput
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          updateColorDebounced(e);
        }}
      >
        <Button css={tw`w-full py-2 mb-4 font-semibold`}>CUSTOM</Button>
      </ColorInput>

      <Colors
        color={color}
        colors={computedColors}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
      />
    </div>
  );
};
