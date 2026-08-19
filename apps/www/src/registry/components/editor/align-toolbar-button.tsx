'use client';

import * as React from 'react';

import type { Alignment } from '@platejs/basic-styles';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { TextAlignPlugin } from '@platejs/basic-styles/react';
import { ElementApi } from 'platejs';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from 'lucide-react';
import { useEditor, useSelectionFragmentProp } from 'platejs/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ToolbarButton } from './toolbar';

const items = [
  {
    icon: AlignLeftIcon,
    value: 'left',
  },
  {
    icon: AlignCenterIcon,
    value: 'center',
  },
  {
    icon: AlignRightIcon,
    value: 'right',
  },
  {
    icon: AlignJustifyIcon,
    value: 'justify',
  },
] as const satisfies readonly {
  icon: React.ComponentType;
  value: Alignment;
}[];

export function AlignToolbarButton(props: DropdownMenuProps) {
  const editor = useEditor();
  const value =
    useSelectionFragmentProp({
      defaultValue: 'start',
      getProp: (node) =>
        ElementApi.isElement(node)
          ? items.find(({ value }) => value === node.textAlign)?.value
          : undefined,
    }) ?? 'left';
  const selectedValue = String(value);

  const [open, setOpen] = React.useState(false);
  const IconValue =
    items.find((item) => item.value === value)?.icon ?? AlignLeftIcon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Align" isDropdown>
          <IconValue />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={(value) => {
            const alignment = items.find((item) => item.value === value)?.value;

            if (!alignment) return;

            editor.plugin(TextAlignPlugin).update.set(alignment);
            editor.api.dom.focus();
          }}
        >
          {items.map(({ icon: Icon, value: itemValue }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              className="pl-2 data-[state=checked]:bg-accent *:first:[span]:hidden"
              value={itemValue}
            >
              <Icon />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
