'use client';

import React from 'react';
import {
  useAlignDropdownMenu,
  useAlignDropdownMenuState,
} from '@udecode/plate-alignment/react';

import { Icons, iconVariants } from '@/components/icons';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

const items = [
  {
    icon: Icons.alignLeft,
    value: 'left',
  },
  {
    icon: Icons.alignCenter,
    value: 'center',
  },
  {
    icon: Icons.alignRight,
    value: 'right',
  },
  {
    icon: Icons.alignJustify,
    value: 'justify',
  },
];

export function AlignDropdownMenu({ children, ...props }: DropdownMenuProps) {
  const state = useAlignDropdownMenuState();
  const { radioGroupProps } = useAlignDropdownMenu(state);

  const openState = useOpenState();
  const IconValue =
    items.find((item) => item.value === radioGroupProps.value)?.icon ??
    Icons.alignLeft;

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Align" isDropdown>
          <IconValue />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          {...radioGroupProps}
        >
          {items.map(({ icon: Icon, value: itemValue }) => (
            <DropdownMenuRadioItem key={itemValue} value={itemValue} hideIcon>
              <Icon className={iconVariants({ variant: 'toolbar' })} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
