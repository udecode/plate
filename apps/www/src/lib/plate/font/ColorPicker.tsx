import React from 'react';
import { cn } from '@udecode/plate-tailwind';
import { Colors } from './Colors';
import { CustomColors } from './CustomColors';
import { TColor } from './TColor';

import { buttonVariants } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

type ColorPickerProps = {
  color?: string;
  colors: TColor[];
  customColors: TColor[];
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
    <div className={cn('flex flex-col gap-4 p-4', className)} {...props}>
      <CustomColors
        color={color}
        colors={colors}
        customColors={customColors}
        updateColor={updateColor}
        updateCustomColor={updateCustomColor}
      />

      <Separator />

      <Colors color={color} colors={colors} updateColor={updateColor} />
      {color && (
        <DropdownMenuItem
          className={buttonVariants({
            variant: 'outline',
            isMenu: true,
          })}
          onClick={clearColor}
        >
          Clear
        </DropdownMenuItem>
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
