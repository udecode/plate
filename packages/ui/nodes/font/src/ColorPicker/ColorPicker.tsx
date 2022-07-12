import React, { ReactNode } from 'react';
import { PlateButton } from '@udecode/plate-ui-button';
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
  open?: boolean;
};

const ColorPickerInternal = ({
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
      <div tw="border border-gray-200 border-solid" />
      <Colors
        color={color}
        colors={colors}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
      />
      <PlateButton
        data-testid="ColorPickerClear"
        tw="w-full py-2"
        onClick={clearColor}
        disabled={!color}
      >
        Clear
      </PlateButton>
    </div>
  );
};

export const ColorPicker = React.memo(
  ColorPickerInternal,
  (prev, next) =>
    prev.color === next.color &&
    prev.colors === next.colors &&
    prev.customColors === next.customColors &&
    prev.open === next.open
);
