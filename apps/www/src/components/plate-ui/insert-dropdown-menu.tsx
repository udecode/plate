import React from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  ELEMENT_CODE_BLOCK,
  insertEmptyCodeBlock,
} from '@udecode/plate-code-block';
import {
  focusEditor,
  insertEmptyElement,
  useEventPlateId,
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
import { ListStyleType, toggleIndentList } from '@udecode/plate-indent-list';
import { ELEMENT_LINK, triggerFloatingLink } from '@udecode/plate-link';
import { ELEMENT_OL, ELEMENT_UL, toggleList } from '@udecode/plate-list';
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  insertMedia,
} from '@udecode/plate-media';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { ELEMENT_TABLE, insertTable } from '@udecode/plate-table';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorState } from '@/types/plate.types';

const items = [
  {
    label: 'Basic blocks',
    items: [
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
        value: ELEMENT_TABLE,
        label: 'Table',
        tooltip: 'Table',
        icon: Icons.table,
      },
      {
        // value: ELEMENT_UL,
        value: ListStyleType.Disc,
        label: 'Bulleted list',
        tooltip: 'Bulleted list',
        icon: Icons.ul,
      },
      {
        value: ListStyleType.Decimal,
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
      {
        value: ELEMENT_HR,
        label: 'Divider',
        tooltip: 'Divider (---)',
        icon: Icons.hr,
      },
    ],
  },
  {
    label: 'Media',
    items: [
      {
        value: ELEMENT_CODE_BLOCK,
        label: 'Code',
        tooltip: 'Code (```)',
        icon: Icons.codeblock,
      },
      {
        value: ELEMENT_IMAGE,
        label: 'Image',
        tooltip: 'Image',
        icon: Icons.image,
      },
      {
        value: ELEMENT_MEDIA_EMBED,
        label: 'Embed',
        tooltip: 'Embed',
        icon: Icons.embed,
      },
      {
        value: ELEMENT_EXCALIDRAW,
        label: 'Excalidraw',
        tooltip: 'Excalidraw',
        icon: Icons.excalidraw,
      },
    ],
  },
  {
    label: 'Inline',
    items: [
      {
        value: ELEMENT_LINK,
        label: 'Link',
        tooltip: 'Link',
        icon: Icons.link,
      },
    ],
  },
];

export function InsertDropdownMenu(props: DropdownMenuProps) {
  const editor = useMyPlateEditorState(useEventPlateId());
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert" isDropdown>
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
              ({ value: type, label: itemLabel, icon: Icon }) => (
                <DropdownMenuItem
                  key={type}
                  className="min-w-[180px]"
                  onSelect={async () => {
                    if (type === ELEMENT_CODE_BLOCK) {
                      insertEmptyCodeBlock(editor);
                    } else if (type === ELEMENT_IMAGE) {
                      await insertMedia(editor, { type: ELEMENT_IMAGE });
                    } else if (type === ELEMENT_MEDIA_EMBED) {
                      await insertMedia(editor, { type: ELEMENT_MEDIA_EMBED });
                    } else if (type === ELEMENT_UL || type === ELEMENT_OL) {
                      insertEmptyElement(editor, ELEMENT_PARAGRAPH, {
                        select: true,
                        nextBlock: true,
                      });

                      toggleList(editor, { type });
                    } else if (
                      type === ListStyleType.Disc ||
                      type === ListStyleType.Decimal
                    ) {
                      insertEmptyElement(editor, ELEMENT_PARAGRAPH, {
                        select: true,
                        nextBlock: true,
                      });

                      toggleIndentList(editor, { listStyleType: type });
                    } else if (type === ELEMENT_TABLE) {
                      insertTable(editor);
                    } else if (type === ELEMENT_LINK) {
                      triggerFloatingLink(editor, { focused: true });
                    } else {
                      insertEmptyElement(editor, type, {
                        select: true,
                        nextBlock: true,
                      });
                    }

                    focusEditor(editor);
                  }}
                >
                  <Icon className="mr-2 h-5 w-5" />
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
