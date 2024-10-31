import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  type TElement,
  getNodeEntries,
  isBlock,
  setNodes,
  unsetNodes,
} from '@udecode/plate-common';
import {
  ParagraphPlugin,
  focusEditor,
  useEditorSelector,
} from '@udecode/plate-common/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { unwrapList } from '@udecode/plate-list';
import { ListPlugin } from '@udecode/plate-list/react';
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
} from 'lucide-react';

import { CheckPlugin } from '@/components/context/check-plugin';
import { useMyEditorRef } from '@/registry/default/lib/plate-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from '@/registry/default/plate-ui/dropdown-menu';
import { ToolbarButton } from '@/registry/default/plate-ui/toolbar';

const items = [
  {
    description: 'Paragraph',
    icon: PilcrowIcon,
    label: 'Paragraph',
    plugin: HeadingPlugin,
    value: ParagraphPlugin.key,
  },
  {
    description: 'Heading 1',
    icon: Heading1Icon,
    label: 'Heading 1',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h1,
  },
  {
    description: 'Heading 2',
    icon: Heading2Icon,
    label: 'Heading 2',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h2,
  },
  {
    description: 'Heading 3',
    icon: Heading3Icon,
    label: 'Heading 3',
    plugin: HeadingPlugin,
    value: HEADING_KEYS.h3,
  },
  {
    description: 'Bulleted list',
    icon: ListIcon,
    label: 'Bulleted list',
    plugin: ListPlugin,
    value: 'ul',
  },
  {
    description: 'Numbered list',
    icon: ListOrderedIcon,
    label: 'Numbered list',
    plugin: ListPlugin,
    value: 'ol',
  },
  {
    description: 'Bulleted list',
    icon: ListIcon,
    label: 'Bulleted list',
    plugin: IndentListPlugin,
    value: ListStyleType.Disc,
  },
  {
    description: 'Numbered list',
    icon: ListOrderedIcon,
    label: 'Numbered list',
    plugin: IndentListPlugin,
    value: ListStyleType.Decimal,
  },
  {
    description: 'Quote (⌘+⇧+.)',
    icon: QuoteIcon,
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

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Turn into" isDropdown>
          <SelectedItemIcon className="lg:hidden" />
          <span className="max-lg:hidden">{selectedItemLabel}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar min-w-0 p-0"
        data-plate-prevent-overlay
        align="start"
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(type: any) => {
            if (type === ListStyleType.Disc || type === ListStyleType.Decimal) {
              setNodes(editor, { type: 'p' });
              toggleIndentList(editor, {
                listStyleType: type,
              });
            } else if (type === 'ul' || type === 'ol') {
              editor.tf.toggle.list({ type });
            } else {
              unwrapList(editor);
              unsetNodes<TElement>(editor, ['indent', 'listStyleType']);
              editor.tf.toggle.block({ type });
            }

            focusEditor(editor);
          }}
          label="Turn into"
        >
          {items.map(({ icon: Icon, label, plugin, value: itemValue }) => (
            <CheckPlugin key={itemValue} plugin={plugin}>
              <DropdownMenuRadioItem
                className="min-w-[180px]"
                value={itemValue}
              >
                <Icon />
                {label}
              </DropdownMenuRadioItem>
            </CheckPlugin>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
