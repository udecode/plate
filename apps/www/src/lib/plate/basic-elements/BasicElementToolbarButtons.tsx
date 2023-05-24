import React, { useCallback, useState } from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_PARAGRAPH,
  getPluginType,
  useEventPlateId,
} from '@udecode/plate';
import { focusEditor, toggleNodeType } from '@udecode/plate-common';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { CodeBlockToolbarButton } from '@/plate/code-block/CodeBlockToolbarButton';
import { BlockToolbarButton } from '@/plate/toolbar/BlockToolbarButton';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

const items = [
  {
    value: ELEMENT_PARAGRAPH,
    text: 'Paragraph',
    tooltip: 'Paragraph',
    icon: Icons.paragraph,
  },
  {
    value: ELEMENT_H1,
    text: 'Heading 1',
    tooltip: 'Heading 1',
    icon: Icons.h1,
  },
  {
    value: ELEMENT_H2,
    text: 'Heading 2',
    tooltip: 'Heading 2',
    icon: Icons.h2,
  },
  {
    value: ELEMENT_H3,
    text: 'Heading 3',
    tooltip: 'Heading 3',
    icon: Icons.h3,
  },
  {
    value: ELEMENT_H4,
    text: 'Heading 4',
    tooltip: 'Heading 4',
    icon: Icons.h4,
  },
  {
    value: ELEMENT_H5,
    text: 'Heading 5',
    tooltip: 'Heading 5',
    icon: Icons.h5,
  },
  {
    value: ELEMENT_H6,
    text: 'Heading 6',
    tooltip: 'Heading 6',
    icon: Icons.h6,
  },
  {
    value: ELEMENT_BLOCKQUOTE,
    text: 'Block Quote',
    tooltip: 'Block Quote (⌘+⇧+.)',
    icon: Icons.blockquote,
  },
];

export function BasicElementToolbarButtons(props: DropdownMenuProps) {
  const editor = useMyPlateEditorRef(useEventPlateId());

  const value = 'h1';

  const [open, setOpen] = useState(false);
  const onToggle = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );
  const valueText =
    items.find((item) => item.value === value)?.text ?? 'Paragraph';

  return (
    <>
      <DropdownMenu
        open={open}
        modal={false}
        onOpenChange={onToggle}
        {...props}
      >
        <DropdownMenuTrigger asChild>
          <ToolbarButton pressed={open} tooltip="Turn into" isDropdown>
            {valueText}
          </ToolbarButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="min-w-0">
          <DropdownMenuRadioGroup
            className="flex flex-col gap-0.5"
            value={value}
            onValueChange={(newValue) => {
              toggleNodeType(editor, { activeType: newValue });
              focusEditor(editor);
            }}
          >
            {items.map(({ value: itemValue, text }) => (
              <DropdownMenuRadioItem
                key={itemValue}
                value={itemValue}
                className="min-w-[180px]"
              >
                {text}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <BlockToolbarButton
        tooltip="Heading 1"
        nodeType={getPluginType(editor, ELEMENT_H1)}
      >
        <Icons.h1 />
      </BlockToolbarButton>

      <CodeBlockToolbarButton>
        <Icons.codeblock />
      </CodeBlockToolbarButton>
    </>
  );
}
