import React, { ReactNode } from 'react';
import { cn } from '@udecode/plate-styled-components';
import { Button } from '@udecode/plate-ui-button';
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
} & React.HTMLAttributes<HTMLDivElement>;

const ColorPickerInternal = ({
  color,
  colors,
  customColors,
  selectedIcon,
  updateColor,
  updateCustomColor,
  clearColor,
  className,
  ...props
}: ColorPickerProps) => {
  return (
    <div
      data-testid="ColorPicker"
      className={cn('flex flex-col space-y-4 p-4', className)}
      {...props}
    >
      <CustomColors
        color={color}
        colors={colors}
        customColors={customColors}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
        updateCustomColor={updateCustomColor}
      />
      <div className="border border-solid border-gray-200" />
      <Colors
        color={color}
        colors={colors}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
      />
      <Button
        className="w-full py-2"
        data-testid="ColorPickerClear"
        onClick={clearColor}
        disabled={!color}
      >
        Clear
      </Button>
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
