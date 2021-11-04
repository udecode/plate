import React, { ReactNode } from 'react';
import { Button } from '@udecode/plate-ui-button';
import tw from 'twin.macro';
import { getColorPickerStyles } from './ColorPicker.styles';
import { Colors } from './Colors';
import { ColorType } from './ColorType';
import { CustomColors } from './CustomColors';

type ColorPickerProps = {
  color?: string;
  colors: ColorType[];
  customColors: ColorType[];
  selectedIcon: ReactNode;
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
  clearColor: () => void;
};

export const ColorPicker = ({
  color,
  colors,
  customColors,
  selectedIcon,
  updateColor,
  updateCustomColor,
  clearColor,
}: ColorPickerProps) => {
  const styles = getColorPickerStyles();

  return (
    <div data-testid="ColorPicker" css={styles.root.css}>
      <CustomColors
        color={color}
        colors={colors}
        customColors={customColors}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
        updateCustomColor={updateCustomColor}
      />
      <div css={tw`border border-gray-200 border-solid`} />
      <Colors
        color={color}
        colors={colors}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
      />
      <Button
        data-testid="ColorPickerClear"
        css={tw`w-full py-2`}
        onClick={clearColor}
        disabled={!color}
      >
        Clear
      </Button>
    </div>
  );
};
