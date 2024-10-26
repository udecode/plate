'use client';

import React from 'react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { insertEmptyCodeBlock } from '@udecode/plate-code-block';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { insertEmptyElement } from '@udecode/plate-common';
import { focusEditor, ParagraphPlugin } from '@udecode/plate-common/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS, insertToc } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { toggleIndentList } from '@udecode/plate-indent-list';
import { insertColumnGroup } from '@udecode/plate-layout';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin, triggerFloatingLink } from '@udecode/plate-link/react';
import { insertMedia } from '@udecode/plate-media';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { insertTable, TablePlugin } from '@udecode/plate-table/react';

import { useMyEditorRef } from '@/lib/plate/plate-types';
import { Icons } from '@/components/icons';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

const items = [
  {
    items: [
      {
        description: 'Paragraph',
        icon: Icons.paragraph,
        label: 'Paragraph',
        value: ParagraphPlugin.key,
      },
      {
        description: 'Heading 1',
        icon: Icons.h1,
        label: 'Heading 1',
        value: HEADING_KEYS.h1,
      },
      {
        description: 'Heading 2',
        icon: Icons.h2,
        label: 'Heading 2',
        value: HEADING_KEYS.h2,
      },
      {
        description: 'Heading 3',
        icon: Icons.h3,
        label: 'Heading 3',
        value: HEADING_KEYS.h3,
      },
      {
        description: 'Heading 4',
        icon: Icons.h4,
        label: 'Heading 4',
        value: HEADING_KEYS.h4,
      },
      {
        description: 'Heading 5',
        icon: Icons.h5,
        label: 'Heading 5',
        value: HEADING_KEYS.h5,
      },
      {
        description: 'Heading 6',
        icon: Icons.h6,
        label: 'Heading 6',
        value: HEADING_KEYS.h6,
      },
      {
        description: 'Table',
        icon: Icons.table,
        label: 'Table',
        value: TablePlugin.key,
      },
      {
        description: 'Bulleted list',
        icon: Icons.ul,
        label: 'Bulleted list',
        value: 'ul',
      },
      {
        description: 'Numbered list',
        icon: Icons.ol,
        label: 'Numbered list',
        value: 'ol',
      },
      {
        description: 'Quote (⌘+⇧+.)',
        icon: Icons.blockquote,
        label: 'Quote',
        value: BlockquotePlugin.key,
      },
      {
        description: 'Divider (---)',
        icon: Icons.hr,
        label: 'Divider',
        value: HorizontalRulePlugin.key,
      },
      {
        description: 'Columns',
        icon: Icons.LayoutIcon,
        label: 'Columns',
        value: ColumnPlugin.key,
      },
      {
        description: 'Table of Contents',
        icon: Icons.h3,
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
        icon: Icons.codeblock,
        label: 'Code',
        value: CodeBlockPlugin.key,
      },
      {
        description: 'Image',
        icon: Icons.image,
        label: 'Image',
        value: ImagePlugin.key,
      },
      {
        description: 'Embed',
        icon: Icons.embed,
        label: 'Embed',
        value: MediaEmbedPlugin.key,
      },
      {
        description: 'Excalidraw',
        icon: Icons.excalidraw,
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
        icon: Icons.link,
        label: 'Link',
        value: LinkPlugin.key,
      },
    ],
    label: 'Inline',
  },
];

export function InsertDropdownMenu(props: DropdownMenuProps) {
  const editor = useMyEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert" isDropdown>
          <Icons.add />
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
                <DropdownMenuItem
                  key={itemLabel}
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

                        toggleIndentList(editor, {
                          listStyleType: type === 'ul' ? 'disc' : 'decimal',
                        });

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
              )
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
