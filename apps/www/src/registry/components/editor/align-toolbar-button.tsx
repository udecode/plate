'use client';

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from 'lucide-react';
import { type Alignment, ElementApi } from 'platejs';
import {
  TextAlignPlugin,
  useEditor,
  useSelectionFragmentProp,
} from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const items = [
  {
    icon: <AlignLeftIcon />,
    value: 'left',
  },
  {
    icon: <AlignCenterIcon />,
    value: 'center',
  },
  {
    icon: <AlignRightIcon />,
    value: 'right',
  },
  {
    icon: <AlignJustifyIcon />,
    value: 'justify',
  },
] as const satisfies ReadonlyArray<{
  icon: React.ReactNode;
  value: Alignment;
}>;

export function AlignToolbarButton() {
  const editor = useEditor();
  const value = useSelectionFragmentProp({
    getProp: (node) =>
      ElementApi.isElement(node) ? (node.textAlign ?? 'start') : undefined,
  });

  const [open, setOpen] = React.useState(false);
  const icon =
    items.find((item) => item.value === value)?.icon ?? items[0].icon;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton pressed={open} tooltip="Align" isDropdown>
          {icon}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        <DropdownMenuRadioGroup
          value={typeof value === 'string' ? value : ''}
          onValueChange={(innerValue2) => {
            const alignment = items.find(
              (item) => item.value === innerValue2
            )?.value;

            if (!alignment) return;

            editor.plugin(TextAlignPlugin).update.set(alignment);
          }}
        >
          {items.map(({ icon: itemIcon, value: itemValue }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              className="ps-2 data-[state=checked]:bg-accent *:first:[span]:hidden"
              finalFocus={() => editor.api.dom.focus()}
              value={itemValue}
            >
              {itemIcon}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
