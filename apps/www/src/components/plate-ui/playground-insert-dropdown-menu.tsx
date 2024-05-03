'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  focusEditor,
  insertEmptyElement,
  useEditorRef,
} from '@udecode/plate-common';
import { ELEMENT_EXCALIDRAW } from '@udecode/plate-excalidraw';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import {
  KEY_LIST_STYLE_TYPE,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import { ELEMENT_COLUMN_GROUP, insertColumnGroup } from '@udecode/plate-layout';
import { ELEMENT_LINK, triggerFloatingLink } from '@udecode/plate-link';
import { toggleList } from '@udecode/plate-list';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  insertMedia,
} from '@udecode/plate-media';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { ELEMENT_TABLE, insertTable } from '@udecode/plate-table';

import { settingsStore } from '@/components/context/settings-store';
import { Icons } from '@/components/icons';
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
        icon: Icons.paragraph,
        label: 'Paragraph',
        value: ELEMENT_PARAGRAPH,
      },
      {
        description: 'Heading 1',
        icon: Icons.h1,
        label: 'Heading 1',
        value: ELEMENT_H1,
      },
      {
        description: 'Heading 2',
        icon: Icons.h2,
        label: 'Heading 2',
        value: ELEMENT_H2,
      },
      {
        description: 'Heading 3',
        icon: Icons.h3,
        label: 'Heading 3',
        value: ELEMENT_H3,
      },
      {
        description: 'Heading 4',
        icon: Icons.h4,
        label: 'Heading 4',
        value: ELEMENT_H4,
      },
      {
        description: 'Heading 5',
        icon: Icons.h5,
        label: 'Heading 5',
        value: ELEMENT_H5,
      },
      {
        description: 'Heading 6',
        icon: Icons.h6,
        label: 'Heading 6',
        value: ELEMENT_H6,
      },
      {
        description: 'Table',
        icon: Icons.table,
        label: 'Table',
        value: ELEMENT_TABLE,
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
        value: ELEMENT_BLOCKQUOTE,
      },
      {
        description: 'Divider (---)',
        icon: Icons.hr,
        label: 'Divider',
        value: ELEMENT_HR,
      },
      {
        description: 'Columns',
        icon: Icons.LayoutIcon,
        label: 'Columns',
        value: ELEMENT_COLUMN_GROUP,
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
        value: ELEMENT_CODE_BLOCK,
      },
      {
        description: 'Image',
        icon: Icons.image,
        label: 'Image',
        value: ELEMENT_IMAGE,
      },
      {
        description: 'Embed',
        icon: Icons.embed,
        label: 'Embed',
        value: ELEMENT_MEDIA_EMBED,
      },
      {
        description: 'Excalidraw',
        icon: Icons.excalidraw,
        label: 'Excalidraw',
        value: ELEMENT_EXCALIDRAW,
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
        value: ELEMENT_LINK,
      },
    ],
    label: 'Inline',
  },
];

export function PlaygroundInsertDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton isDropdown pressed={openState.open} tooltip="Insert">
          <Icons.add />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
      >
        {items.map(({ items: nestedItems, label }, index) => (
          <React.Fragment key={label}>
            {index !== 0 && <DropdownMenuSeparator />}

            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            {nestedItems.map(
              ({ icon: Icon, label: itemLabel, value: type }) => (
                <DropdownMenuItem
                  className="min-w-[180px]"
                  key={type}
                  onSelect={async () => {
                    switch (type) {
                      case ELEMENT_COLUMN_GROUP: {
                        insertColumnGroup(editor);

                        break;
                      }
                      case ELEMENT_CODE_BLOCK: {
                        insertEmptyCodeBlock(editor);

                        break;
                      }
                      case ELEMENT_IMAGE: {
                        await insertMedia(editor, { type: ELEMENT_IMAGE });

                        break;
                      }
                      case ELEMENT_MEDIA_EMBED: {
                        await insertMedia(editor, {
                          type: ELEMENT_MEDIA_EMBED,
                        });

                        break;
                      }
                      case 'ul':
                      case 'ol': {
                        insertEmptyElement(editor, ELEMENT_PARAGRAPH, {
                          nextBlock: true,
                          select: true,
                        });

                        if (settingsStore.get.checkedId(KEY_LIST_STYLE_TYPE)) {
                          toggleIndentList(editor, {
                            listStyleType: type === 'ul' ? 'disc' : 'decimal',
                          });
                        } else if (settingsStore.get.checkedId('list')) {
                          toggleList(editor, { type });
                        }

                        break;
                      }
                      case ELEMENT_TABLE: {
                        insertTable(editor);

                        break;
                      }
                      case ELEMENT_LINK: {
                        triggerFloatingLink(editor, { focused: true });

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
