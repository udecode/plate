import React from 'react';
import { cn } from '@udecode/plate-tailwind';
import { Colors } from './Colors';
import { ColorType } from './ColorType';
import { CustomColors } from './CustomColors';

import { Button } from '@/components/ui/button';

type ColorPickerProps = {
  color?: string;
  colors: ColorType[];
  customColors: ColorType[];
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
  clearColor: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

export function ColorPickerContent({
  color,
  colors,
  customColors,
  updateColor,
  updateCustomColor,
  clearColor,
  className,
  ...props
}: ColorPickerProps) {
  return (
    <div className={cn('flex flex-col space-y-4 p-4', className)} {...props}>
      <CustomColors
        color={color}
        colors={colors}
        customColors={customColors}
        updateColor={updateColor}
        updateCustomColor={updateCustomColor}
      />
      <div className="border border-solid border-gray-200" />
      <Colors color={color} colors={colors} updateColor={updateColor} />
      {color && (
        <Button variant="outline" className="w-full" onClick={clearColor}>
          Clear
        </Button>
      )}
    </div>
  );
}

export const ColorPicker = React.memo(
  ColorPickerContent,
  (prev, next) =>
    prev.color === next.color &&
    prev.colors === next.colors &&
    prev.customColors === next.customColors
);
