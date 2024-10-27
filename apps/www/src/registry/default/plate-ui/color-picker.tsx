'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';

import {
  type TColor,
  ColorDropdownMenuItems,
} from './color-dropdown-menu-items';
import { ColorCustom } from './colors-custom';
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './dropdown-menu';

export const ColorPickerContent = withRef<
  'div',
  {
    clearColor: () => void;
    colors: TColor[];
    customColors: TColor[];
    updateColor: (color: string) => void;
    updateCustomColor: (color: string) => void;
    color?: string;
  }
>(
  (
    {
      className,
      clearColor,
      color,
      colors,
      customColors,
      updateColor,
      updateCustomColor,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('flex flex-col', className)} {...props}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Color Picker</DropdownMenuLabel>
          <ColorDropdownMenuItems
            color={color}
            className="p-2"
            colors={colors}
            updateColor={updateColor}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* {color && (
          <DropdownMenuItem
          className={buttonVariants({
              isMenu: true,
              variant: 'outline',
              })}
              onClick={clearColor}
              >
              Clear
              </DropdownMenuItem>
              )} */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Custom</DropdownMenuLabel>

          <ColorCustom
            color={color}
            className="p-2"
            clearColor={clearColor}
            colors={colors}
            customColors={customColors}
            updateColor={updateColor}
            updateCustomColor={updateCustomColor}
          />
        </DropdownMenuGroup>
      </div>
    );
  }
);

export const ColorPicker = React.memo(
  ColorPickerContent,
  (prev, next) =>
    prev.color === next.color &&
    prev.colors === next.colors &&
    prev.customColors === next.customColors
);
