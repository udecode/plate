import React, { useCallback, useState } from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { Alignment, KEY_ALIGN, setAlign } from '@udecode/plate-alignment';
import {
  findNode,
  focusEditor,
  isCollapsed,
  isDefined,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';

import { Icons, iconVariants } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';

export interface AlignDropdownMenuProps extends DropdownMenuProps {
  id?: string;
  pluginKey?: string;
}

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

export function AlignDropdownMenu({
  id,
  pluginKey = KEY_ALIGN,
  children,
  ...props
}: AlignDropdownMenuProps) {
  const editor = usePlateEditorState(useEventPlateId(id));

  let value: Alignment = 'left';
  if (isCollapsed(editor?.selection)) {
    const entry = findNode(editor!, { match: (n) => isDefined(n[pluginKey]) });
    if (entry) {
      const nodeValue = entry[0][pluginKey] as string;
      if (nodeValue === 'right') value = 'right';
      if (nodeValue === 'center') value = 'center';
      if (nodeValue === 'justify') value = 'justify';
    }
  }

  const [open, setOpen] = useState(false);
  const onToggle = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );
  const IconValue =
    items.find((item) => item.value === value)?.icon ?? Icons.alignLeft;

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
          value={value}
          onValueChange={(newValue) => {
            setAlign(editor, {
              value: newValue as Alignment,
              key: pluginKey,
            });

            focusEditor(editor);
          }}
        >
          {items.map(({ value: itemValue, icon: Icon }) => (
            <DropdownMenuRadioItem key={itemValue} value={itemValue}>
              <Icon className={iconVariants({ variant: 'toolbar' })} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
