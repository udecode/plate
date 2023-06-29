'use client';

import React from 'react';
import { useColorsCustom, useColorsCustomState } from '@udecode/plate-font';
import { TColor } from './color-dropdown-menu';
import { ColorDropdownMenuItems } from './color-dropdown-menu-items';
import { ColorInput } from './color-input';

import { buttonVariants } from '@/registry/default/plate-ui/button';
import { DropdownMenuItem } from '@/registry/default/plate-ui/dropdown-menu';

type ColorsCustomProps = {
  color?: string;
  colors: TColor[];
  customColors: TColor[];
  updateCustomColor: (color: string) => void;
  updateColor: (color: string) => void;
};

export function ColorsCustom({
  color,
  colors,
  customColors,
  updateColor,
  updateCustomColor,
}: ColorsCustomProps) {
  const state = useColorsCustomState({
    color,
    colors,
    customColors,
    updateCustomColor,
  });
  const { inputProps, menuItemProps } = useColorsCustom(state);

  return (
    <div className="flex flex-col gap-4">
      <ColorInput {...inputProps}>
        <DropdownMenuItem
          className={buttonVariants({
            variant: 'outline',
            isMenu: true,
          })}
          {...menuItemProps}
        >
          CUSTOM
        </DropdownMenuItem>
      </ColorInput>

      <ColorDropdownMenuItems
        color={color}
        colors={state.computedColors}
        updateColor={updateColor}
      />
    </div>
  );
}
