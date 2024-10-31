'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { insertEmptyCodeBlock } from '@udecode/plate-code-block';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { insertEmptyElement } from '@udecode/plate-common';
import { ParagraphPlugin, focusEditor } from '@udecode/plate-common/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS, insertToc } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { toggleIndentList } from '@udecode/plate-indent-list';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { insertColumnGroup } from '@udecode/plate-layout';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin, triggerFloatingLink } from '@udecode/plate-link/react';
import { insertMedia } from '@udecode/plate-media';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { TablePlugin, insertTable } from '@udecode/plate-table/react';
import {
  Columns2Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';

import { CheckPlugin } from '@/components/context/check-plugin';
import { settingsStore } from '@/components/context/settings-store';
import { useMyEditorRef } from '@/registry/default/lib/plate-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useOpenState,
} from '@/registry/default/plate-ui/dropdown-menu';
import { ToolbarButton } from '@/registry/default/plate-ui/toolbar';

const items = [
  {
    items: [
      {
        description: 'Paragraph',
        icon: PilcrowIcon,
        label: 'Paragraph',
        value: ParagraphPlugin.key,
      },
      {
        description: 'Heading 1',
        icon: Heading1Icon,
        label: 'Heading 1',
        value: HEADING_KEYS.h1,
      },
      {
        description: 'Heading 2',
        icon: Heading2Icon,
        label: 'Heading 2',
        value: HEADING_KEYS.h2,
      },
      {
        description: 'Heading 3',
        icon: Heading3Icon,
        label: 'Heading 3',
        value: HEADING_KEYS.h3,
      },
      {
        description: 'Heading 4',
        icon: Heading4Icon,
        label: 'Heading 4',
        value: HEADING_KEYS.h4,
      },
      {
        description: 'Heading 5',
        icon: Heading5Icon,
        label: 'Heading 5',
        value: HEADING_KEYS.h5,
      },
      {
        description: 'Heading 6',
        icon: Heading6Icon,
        label: 'Heading 6',
        value: HEADING_KEYS.h6,
      },
      {
        description: 'Table',
        icon: TableIcon,
        label: 'Table',
        value: TablePlugin.key,
      },
      {
        description: 'Bulleted list',
        icon: ListIcon,
        label: 'Bulleted list',
        value: 'ul',
      },
      {
        description: 'Numbered list',
        icon: ListOrderedIcon,
        label: 'Numbered list',
        value: 'ol',
      },
      {
        description: 'Quote (⌘+⇧+.)',
        icon: QuoteIcon,
        label: 'Quote',
        value: BlockquotePlugin.key,
      },
      {
        description: 'Divider (---)',
        icon: MinusIcon,
        label: 'Divider',
        value: HorizontalRulePlugin.key,
      },
      {
        description: 'Columns',
        icon: Columns2Icon,
        label: 'Columns',
        value: ColumnPlugin.key,
      },
      {
        description: 'Table of Contents',
        icon: TableOfContentsIcon,
        label: 'Table of Contents',
        value: TocPlugin.key,
      },
    ],
    label: 'Basic blocks',
  },
  {
    items: [
      {
        description: 'Code (```)',
        icon: FileCodeIcon,
        label: 'Code',
        value: CodeBlockPlugin.key,
      },
      {
        description: 'Image',
        icon: ImageIcon,
        label: 'Image',
        value: ImagePlugin.key,
      },
      {
        description: 'Embed',
        icon: FilmIcon,
        label: 'Embed',
        value: MediaEmbedPlugin.key,
      },
      {
        description: 'Excalidraw',
        icon: PenToolIcon,
        label: 'Excalidraw',
        value: ExcalidrawPlugin.key,
      },
    ],
    label: 'Media',
  },
  {
    items: [
      {
        description: 'Link',
        icon: Link2Icon,
        label: 'Link',
        value: LinkPlugin.key,
      },
    ],
    label: 'Inline',
  },
];

export function PlaygroundInsertDropdownMenu(props: DropdownMenuProps) {
  const editor = useMyEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        {items.map(({ items: nestedItems, label }, index) => (
          <React.Fragment key={label}>
            {index !== 0 && <DropdownMenuSeparator />}

            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            {nestedItems.map(
              ({ icon: Icon, label: itemLabel, value: type }) => (
                <CheckPlugin key={type} plugin={{ key: type }}>
                  <DropdownMenuItem
                    className="min-w-[180px]"
                    onSelect={async () => {
                      switch (type) {
                        case CodeBlockPlugin.key: {
                          insertEmptyCodeBlock(editor, {
                            insertNodesOptions: { select: true },
                          });

                          break;
                        }
                        case ColumnPlugin.key: {
                          insertColumnGroup(editor);

                          break;
                        }
                        case ImagePlugin.key: {
                          await insertMedia(editor, {
                            select: true,
                            type: ImagePlugin.key,
                          });

                          break;
                        }
                        case LinkPlugin.key: {
                          triggerFloatingLink(editor, { focused: true });

                          break;
                        }
                        case MediaEmbedPlugin.key: {
                          await insertMedia(editor, {
                            select: true,
                            type: MediaEmbedPlugin.key,
                          });

                          break;
                        }
                        case TablePlugin.key: {
                          insertTable(editor, {}, { select: true });

                          break;
                        }
                        case TocPlugin.key: {
                          insertToc(editor);

                          break;
                        }
                        case 'ol':
                        case 'ul': {
                          insertEmptyElement(editor, ParagraphPlugin.key, {
                            nextBlock: true,
                            select: true,
                          });

                          if (
                            settingsStore.get.checkedId(IndentListPlugin.key)
                          ) {
                            toggleIndentList(editor, {
                              listStyleType: type === 'ul' ? 'disc' : 'decimal',
                            });
                          } else if (settingsStore.get.checkedId('list')) {
                            editor.tf.toggle.list({ type });
                          }

                          break;
                        }
                        default: {
                          insertEmptyElement(editor, type, {
                            nextBlock: true,
                            select: true,
                          });
                        }
                      }

                      focusEditor(editor);
                    }}
                  >
                    <Icon className="mr-2 size-5" />
                    {itemLabel}
                  </DropdownMenuItem>
                </CheckPlugin>
              )
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
