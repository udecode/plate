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
] as const satisfies ReadonlyArray<{
  icon: React.ComponentType;
  value: Alignment;
}>;

export function AlignToolbarButton() {
  const editor = useEditor();
  const value =
    useSelectionFragmentProp({
      defaultValue: 'start',
      getProp: (node) =>
        ElementApi.isElement(node)
          ? items.find(({ value: innerValue }) => innerValue === node.textAlign)
              ?.value
          : undefined,
    }) ?? 'left';
  const selectedValue = typeof value === 'string' ? value : 'left';

  const [open, setOpen] = React.useState(false);
  const focusEditorRef = React.useRef(false);
  const IconValue =
    items.find((item) => item.value === value)?.icon ?? AlignLeftIcon;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) focusEditorRef.current = false;
        setOpen(nextOpen);
      }}
      modal={false}
    >
      <DropdownMenuTrigger>
        <ToolbarButton pressed={open} tooltip="Align" isDropdown>
          <IconValue />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-0"
        align="start"
        onFinalFocus={(event) => {
          if (!focusEditorRef.current) return;

          focusEditorRef.current = false;
          event.preventDefault();
          editor.api.dom.focus();
        }}
      >
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={(innerValue2) => {
            const alignment = items.find(
              (item) => item.value === innerValue2
            )?.value;

            if (!alignment) return;

            focusEditorRef.current = true;
            editor.plugin(TextAlignPlugin).update.set(alignment);
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
