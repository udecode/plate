import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  ParagraphPlugin,
  collapseSelection,
  getNodeEntries,
  isBlock,
} from '@udecode/plate-common';
import { focusEditor, useEditorSelector } from '@udecode/plate-common/react';
import { HEADING_KEYS, HeadingPlugin } from '@udecode/plate-heading';
import { toggleIndentList } from '@udecode/plate-indent-list';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { ListPlugin, unwrapList } from '@udecode/plate-list';

import { CheckPlugin } from '@/components/context/check-plugin';
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
} from '@/registry/default/plate-ui/dropdown-menu';
import { ToolbarButton } from '@/registry/default/plate-ui/toolbar';
import { useMyEditorRef } from '@/types/plate-types';

const items = [
  {
    description: 'Paragraph',
    icon: Icons.paragraph,
    label: 'Paragraph',
    plugin: HeadingPlugin,
    value: ParagraphPlugin.key,
  },
  {
    description: 'Heading 1',
    icon: Icons.h1,
    label: 'Heading 1',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h1,
  },
  {
    description: 'Heading 2',
    icon: Icons.h2,
    label: 'Heading 2',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h2,
  },
  {
    description: 'Heading 3',
    icon: Icons.h3,
    label: 'Heading 3',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h3,
  },
  {
    description: 'Heading 4',
    icon: Icons.h4,
    label: 'Heading 4',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h4,
  },
  {
    description: 'Heading 5',
    icon: Icons.h5,
    label: 'Heading 5',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h5,
  },
  {
    description: 'Heading 6',
    icon: Icons.h6,
    label: 'Heading 6',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h6,
  },
  {
    description: 'Bulleted list',
    icon: Icons.ul,
    label: 'Bulleted list',
    plugin: ListPlugin,
    value: 'ul',
  },
  {
    description: 'Numbered list',
    icon: Icons.ol,
    label: 'Numbered list',
    plugin: ListPlugin,
    value: 'ol',
  },
  {
    description: 'Quote (⌘+⇧+.)',
    icon: Icons.blockquote,
    label: 'Quote',
    plugin: BlockquotePlugin,
    value: BlockquotePlugin.key,
  },
];

const defaultItem = items.find((item) => item.value === ParagraphPlugin.key)!;

export function PlaygroundTurnIntoDropdownMenu(props: DropdownMenuProps) {
  const value: string = useEditorSelector((editor) => {
    let initialNodeType: string = ParagraphPlugin.key;
    let allNodesMatchInitialNodeType = false;
    const codeBlockEntries = getNodeEntries(editor, {
      match: (n) => isBlock(editor, n),
      mode: 'highest',
    });
    const nodes = Array.from(codeBlockEntries);

    if (nodes.length > 0) {
      initialNodeType = nodes[0][0].type as string;
      allNodesMatchInitialNodeType = nodes.every(([node]) => {
        const type: string = (node?.type as string) || ParagraphPlugin.key;

        return type === initialNodeType;
      });
    }

    return allNodesMatchInitialNodeType ? initialNodeType : ParagraphPlugin.key;
  }, []);

  const editor = useMyEditorRef();
  const openState = useOpenState();

  const selectedItem =
    items.find((item) => item.value === value) ?? defaultItem;
  const { icon: SelectedItemIcon, label: selectedItemLabel } = selectedItem;

  const onCloseAutoFocus = React.useCallback((e: Event) => {
    focusEditor(editor);

    return e.preventDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className="lg:min-w-[130px]"
          isDropdown
          pressed={openState.open}
          tooltip="Turn into"
        >
          <SelectedItemIcon className="size-5 lg:hidden" />
          <span className="max-lg:hidden">{selectedItemLabel}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-0"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DropdownMenuLabel>Turn into</DropdownMenuLabel>

        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          onValueChange={(type) => {
            if (type === 'ul' || type === 'ol') {
              if (settingsStore.get.checkedId(IndentListPlugin.key)) {
                toggleIndentList(editor, {
                  listStyleType: type === 'ul' ? 'disc' : 'decimal',
                });
              } else if (settingsStore.get.checkedId('list')) {
                editor.tf.toggle.list({ type });
              }
            } else {
              unwrapList(editor);
              editor.tf.toggle.block({ type });
            }

            collapseSelection(editor);
            focusEditor(editor);
          }}
          value={value}
        >
          {items.map(({ icon: Icon, label, plugin, value: itemValue }) => (
            <CheckPlugin key={itemValue} plugin={plugin}>
              <DropdownMenuRadioItem
                className="min-w-[180px]"
                value={itemValue}
              >
                <Icon className="mr-2 size-5" />
                {label}
              </DropdownMenuRadioItem>
            </CheckPlugin>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
