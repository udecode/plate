'use client';

import React from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  useColorDropdownMenu,
  useColorDropdownMenuState,
} from '@udecode/plate-font';
import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './color-constants';
import { ColorPicker } from './color-picker';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/registry/default/ui/dropdown-menu';
import { ToolbarButton } from '@/registry/default/ui/toolbar';

export type TColor = {
  name: string;
  value: string;
  isBrightColor: boolean;
};

type ColorDropdownMenuProps = {
  nodeType: string;
  tooltip?: string;
} & DropdownMenuProps;

export function ColorDropdownMenu({
  nodeType,
  tooltip,
  children,
}: ColorDropdownMenuProps) {
  const state = useColorDropdownMenuState({
    nodeType,
    colors: DEFAULT_COLORS,
    customColors: DEFAULT_CUSTOM_COLORS,
    closeOnSelect: true,
  });

  const { menuProps, buttonProps } = useColorDropdownMenu(state);

  return (
    <DropdownMenu modal={false} {...menuProps}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip} {...buttonProps}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <ColorPicker
          color={state.selectedColor || state.color}
          colors={state.colors}
          customColors={state.customColors}
          updateColor={state.updateColorAndClose}
          updateCustomColor={state.updateColor}
          clearColor={state.clearColor}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
