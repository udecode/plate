'use client';

import * as React from 'react';

import { EraserIcon } from 'lucide-react';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ToolbarMenuGroup } from '@/components/ui/toolbar';

import {
  type TColor,
  ColorDropdownMenuItems,
} from './color-dropdown-menu-items';
import { ColorCustom } from './colors-custom';

type ColorPickerContentProps = React.ComponentProps<'div'> & {
  colors: TColor[];
  customColors: TColor[];
  clearColor: () => void;
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
  color?: string;
};

export function ColorPickerContent({
  className,
  clearColor,
  color,
  colors,
  customColors,
  updateColor,
  updateCustomColor,
  ...props
}: ColorPickerContentProps) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <ToolbarMenuGroup label="Custom Colors">
        <ColorCustom
          color={color}
          className="px-2"
          colors={colors}
          customColors={customColors}
          updateColor={updateColor}
          updateCustomColor={updateCustomColor}
        />
      </ToolbarMenuGroup>
      <ToolbarMenuGroup label="Default Colors">
        <ColorDropdownMenuItems
          color={color}
          className="px-2"
          colors={colors}
          updateColor={updateColor}
        />
      </ToolbarMenuGroup>
      {color && (
        <ToolbarMenuGroup>
          <DropdownMenuItem className="p-2" onClick={clearColor}>
            <EraserIcon />
            <span>Clear</span>
          </DropdownMenuItem>
        </ToolbarMenuGroup>
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
