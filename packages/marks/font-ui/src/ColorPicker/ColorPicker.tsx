import React, { ReactNode } from 'react';
import { Button } from '@udecode/plate-ui-button';
import tw from 'twin.macro';
import { getColorPickerStyles } from './ColorPicker.styles';
import { Colors } from './Colors';
import { CustomColors } from './CustomColors';
import { ColorType, DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './defaults';

type ColorPickerProps = {
  color?: string;
  colors?: ColorType[];
  customColors?: ColorType[];
  selectedIcon: ReactNode;
  updateColor: (color: string) => void;
  clearColor: () => void;
};

export const ColorPicker = ({
  color,
  colors = DEFAULT_COLORS,
  customColors = DEFAULT_CUSTOM_COLORS,
  selectedIcon,
  updateColor,
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
      >
        Clear
      </Button>
    </div>
  );
};
