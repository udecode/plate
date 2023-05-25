import React, { useCallback, useState } from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  collapseSelection,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  isBlock,
  TElement,
  unwrapList,
  useEventPlateId,
} from '@udecode/plate';
import {
  findNode,
  focusEditor,
  isCollapsed,
  toggleNodeType,
} from '@udecode/plate-common';
import { ELEMENT_UL, toggleList } from '@udecode/plate-list';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorState } from '@/plate/typescript/plateTypes';

const items = [
  {
    value: ELEMENT_PARAGRAPH,
    label: 'Paragraph',
    tooltip: 'Paragraph',
    icon: Icons.paragraph,
  },
  {
    value: ELEMENT_H1,
    label: 'Heading 1',
    tooltip: 'Heading 1',
    icon: Icons.h1,
  },
  {
    value: ELEMENT_H2,
    label: 'Heading 2',
    tooltip: 'Heading 2',
    icon: Icons.h2,
  },
  {
    value: ELEMENT_H3,
    label: 'Heading 3',
    tooltip: 'Heading 3',
    icon: Icons.h3,
  },
  {
    value: ELEMENT_H4,
    label: 'Heading 4',
    tooltip: 'Heading 4',
    icon: Icons.h4,
  },
  {
    value: ELEMENT_H5,
    label: 'Heading 5',
    tooltip: 'Heading 5',
    icon: Icons.h5,
  },
  {
    value: ELEMENT_H6,
    label: 'Heading 6',
    tooltip: 'Heading 6',
    icon: Icons.h6,
  },
  {
    value: ELEMENT_UL,
    label: 'Bulleted list',
    tooltip: 'Bulleted list',
    icon: Icons.ul,
  },
  {
    value: ELEMENT_OL,
    label: 'Numbered list',
    tooltip: 'Numbered list',
    icon: Icons.ol,
  },
  {
    value: ELEMENT_BLOCKQUOTE,
    label: 'Quote',
    tooltip: 'Quote (⌘+⇧+.)',
    icon: Icons.blockquote,
  },
];

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
  const editor = useMyPlateEditorState(useEventPlateId());

  let value: string = ELEMENT_PARAGRAPH;
  if (isCollapsed(editor?.selection)) {
    const entry = findNode<TElement>(editor!, {
      match: (n) => isBlock(editor, n),
    });
    if (entry) {
      value =
        items.find((item) => item.value === entry[0].type)?.value ??
        ELEMENT_PARAGRAPH;
    }
  }

  const [open, setOpen] = useState(false);
  const onToggle = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );
  const valueText =
    items.find((item) => item.value === value)?.label ?? 'Paragraph';

  return (
    <DropdownMenu open={open} modal={false} onOpenChange={onToggle} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={open}
          tooltip="Turn into"
          isDropdown
          className="min-w-[140px]"
        >
          {valueText}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuLabel>Turn into</DropdownMenuLabel>

        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          value={value}
          onValueChange={(type) => {
            if (type === ELEMENT_UL || type === ELEMENT_OL) {
              toggleList(editor, { type });
            } else {
              unwrapList(editor);
              toggleNodeType(editor, { activeType: type });
            }

            collapseSelection(editor);
            focusEditor(editor);
          }}
        >
          {items.map(({ value: itemValue, label, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              value={itemValue}
              className="min-w-[180px]"
            >
              <Icon className="mr-2 h-5 w-5" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
