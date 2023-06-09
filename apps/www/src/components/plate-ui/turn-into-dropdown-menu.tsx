import React from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  collapseSelection,
  findNode,
  focusEditor,
  isBlock,
  isCollapsed,
  TElement,
  toggleNodeType,
  useEventPlateId,
} from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import {
  KEY_LIST_STYLE_TYPE,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import { toggleList, unwrapList } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { settingsStore } from '@/components/context/settings-store';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorState } from '@/plate/plate.types';

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
    value: 'ul',
    label: 'Bulleted list',
    tooltip: 'Bulleted list',
    icon: Icons.ul,
  },
  {
    value: 'ol',
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
  const openState = useOpenState();

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

  const valueText =
    items.find((item) => item.value === value)?.label ?? 'Paragraph';

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
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
            if (type === 'ul' || type === 'ol') {
              if (settingsStore.get.checkedId(KEY_LIST_STYLE_TYPE)) {
                toggleIndentList(editor, {
                  listStyleType: type === 'ul' ? 'disc' : 'decimal',
                });
              } else if (settingsStore.get.checkedId('list')) {
                toggleList(editor, { type });
              }
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
