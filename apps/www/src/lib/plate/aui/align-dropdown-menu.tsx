import React from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { Icons, iconVariants } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import {
  useAlignDropdownMenu,
  useAlignDropdownMenuState,
} from '@/lib/@/useAlignDropdownMenu';

const items = [
  {
    value: 'left',
    icon: Icons.alignLeft,
  },
  {
    value: 'center',
    icon: Icons.alignCenter,
  },
  {
    value: 'right',
    icon: Icons.alignRight,
  },
  {
    value: 'justify',
    icon: Icons.alignJustify,
  },
];

export interface AlignDropdownMenuProps extends DropdownMenuProps {}

export function AlignDropdownMenu({
  children,
  ...props
}: AlignDropdownMenuProps) {
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

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          {...radioGroupProps}
        >
          {items.map(({ value: itemValue, icon: Icon }) => (
            <DropdownMenuRadioItem key={itemValue} value={itemValue} hideIcon>
              <Icon className={iconVariants({ variant: 'toolbar' })} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
