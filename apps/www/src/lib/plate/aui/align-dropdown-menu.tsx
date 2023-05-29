import React, { useCallback, useState } from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { useEventPlateId } from '@udecode/plate-common';

import { Icons, iconVariants } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useAlignDropdownMenuRadioGroupProps } from '@/lib/@/useAlignDropdownMenuRadioGroupProps';

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

export interface AlignDropdownMenuProps extends DropdownMenuProps {
  id?: string;
}

export function AlignDropdownMenu({
  id,
  children,
  ...props
}: AlignDropdownMenuProps) {
  const alignDropdownMenuRadioGroupProps = useAlignDropdownMenuRadioGroupProps(
    useEventPlateId(id)
  );

  const [open, setOpen] = useState(false);
  const onToggle = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );
  const IconValue =
    items.find((item) => item.value === alignDropdownMenuRadioGroupProps.value)
      ?.icon ?? Icons.alignLeft;

  return (
    <DropdownMenu open={open} modal={false} onOpenChange={onToggle} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Align" isDropdown>
          <IconValue />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          {...alignDropdownMenuRadioGroupProps}
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
