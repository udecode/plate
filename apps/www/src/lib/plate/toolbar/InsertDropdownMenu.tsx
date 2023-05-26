import React, { useCallback, useState } from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  insertEmptyElement,
  insertTable,
  useEventPlateId,
} from '@udecode/plate';
import { insertEmptyCodeBlock } from '@udecode/plate-code-block';
import { focusEditor } from '@udecode/plate-common';
import { ELEMENT_EXCALIDRAW } from '@udecode/plate-excalidraw';
import { triggerFloatingLink } from '@udecode/plate-link';
import { ELEMENT_UL } from '@udecode/plate-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorState } from '@/plate/demo/plate.types';
import { toggleListDemo } from '@/plate/demo/toggleListDemo';
import { insertMedia } from '@/plate/media/insertMedia';

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

  const [open, setOpen] = useState(false);
  const onToggle = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );

  return (
    <DropdownMenu open={open} modal={false} onOpenChange={onToggle} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Insert" isDropdown>
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
                      await insertMedia(editor, { type: 'image' });
                    } else if (type === ELEMENT_MEDIA_EMBED) {
                      await insertMedia(editor, { type: 'embed' });
                    } else if (type === ELEMENT_UL || type === ELEMENT_OL) {
                      insertEmptyElement(editor, ELEMENT_PARAGRAPH, {
                        select: true,
                        nextBlock: true,
                      });

                      toggleListDemo(editor as any, type);
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
