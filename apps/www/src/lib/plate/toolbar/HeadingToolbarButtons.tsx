import React from 'react';
import {
  ELEMENT_OL,
  ELEMENT_UL,
  KEY_EMOJI,
  MARK_BG_COLOR,
  MARK_BOLD,
  MARK_CODE,
  MARK_COLOR,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  usePlateReadOnly,
} from '@udecode/plate';
import { focusEditor, usePlateEditorRef } from '@udecode/plate-common';
import { InsertDropdownMenu } from './InsertDropdownMenu';
import { MarkToolbarButton } from './MarkToolbarButton';
import { ModeDropdownMenu } from './ModeDropdownMenu';
import { MoreDropdownMenu } from './MoreDropdownMenu';
import { TurnIntoDropdownMenu } from './TurnIntoDropdownMenu';

import { Icons, iconVariants } from '@/components/icons';
import { ToolbarSeparator } from '@/components/ui/toolbar';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { AlignDropdownMenu } from '@/plate/aui/align-dropdown-menu';
import { CommentToolbarButton } from '@/plate/comments/CommentToolbarButton';
import { EmojiDropdownMenu } from '@/plate/emoji/EmojiDropdownMenu';
import { ColorDropdownMenu } from '@/plate/font/ColorDropdownMenu';
import { IndentToolbarButtons } from '@/plate/indent/IndentToolbarButtons';
import { LineHeightToolbarDropdown } from '@/plate/line-height/LineHeightToolbarDropdown';
import { LinkToolbarButton } from '@/plate/link/LinkToolbarButton';
import { ListToolbarButton } from '@/plate/list/ListToolbarButton';
import { insertMedia } from '@/plate/media/insertMedia';
import { TableDropdownMenu } from '@/plate/table/TableDropdownMenu';

export function HeadingToolbarButtons() {
  const editor = usePlateEditorRef();
  const readOnly = usePlateReadOnly();

  return (
    <>
      <div className="flex gap-1">
        {!readOnly && (
          <>
            <InsertDropdownMenu />

            <TurnIntoDropdownMenu />

            <ToolbarSeparator />

            <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
              <Icons.bold />
            </MarkToolbarButton>
            <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
              <Icons.italic />
            </MarkToolbarButton>
            <MarkToolbarButton
              tooltip="Underline (⌘+U)"
              nodeType={MARK_UNDERLINE}
            >
              <Icons.underline />
            </MarkToolbarButton>
            <MarkToolbarButton
              tooltip="Strikethrough (⌘+⇧+M)"
              nodeType={MARK_STRIKETHROUGH}
            >
              <Icons.strikethrough />
            </MarkToolbarButton>
            <MarkToolbarButton tooltip="Code (⌘+E)" nodeType={MARK_CODE}>
              <Icons.code />
            </MarkToolbarButton>

            <ColorDropdownMenu pluginKey={MARK_COLOR} tooltip="Text Color">
              <Icons.color className={iconVariants({ variant: 'toolbar' })} />
            </ColorDropdownMenu>
            <ColorDropdownMenu
              pluginKey={MARK_BG_COLOR}
              tooltip="Highlight Color"
            >
              <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
            </ColorDropdownMenu>

            <ToolbarSeparator />

            <AlignDropdownMenu />

            <LineHeightToolbarDropdown />

            <ListToolbarButton tooltip="Bullet List" nodeType={ELEMENT_UL}>
              <Icons.ul />
            </ListToolbarButton>
            <ListToolbarButton tooltip="Ordered List" nodeType={ELEMENT_OL}>
              <Icons.ol />
            </ListToolbarButton>

            <IndentToolbarButtons />

            <ToolbarSeparator />

            <LinkToolbarButton>
              <Icons.link />
            </LinkToolbarButton>

            <ToolbarButton
              onClick={async () => {
                await insertMedia(editor, { type: 'image' });
                focusEditor(editor);
              }}
            >
              <Icons.image />
            </ToolbarButton>

            <TableDropdownMenu />
            <EmojiDropdownMenu tooltip="Emoji" pluginKey={KEY_EMOJI}>
              <Icons.emoji />
            </EmojiDropdownMenu>
            <MoreDropdownMenu />
          </>
        )}
      </div>

      <div className="flex gap-1">
        {readOnly && (
          <CommentToolbarButton>
            <Icons.commentAdd />
          </CommentToolbarButton>
        )}
        <ModeDropdownMenu />
      </div>
    </>
  );
}
