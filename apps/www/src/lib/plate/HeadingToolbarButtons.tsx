import React from 'react';
import {
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
import { AlignDropdownMenu } from './align/AlignDropdownMenu';
import { CommentToolbarButton } from './comments/CommentToolbarButton';
import { EmojiDropdownMenu } from './emoji/EmojiDropdownMenu';
import { ColorDropdownMenu } from './font/ColorDropdownMenu';
import { IndentToolbarButtons } from './indent/IndentToolbarButtons';
import { LineHeightToolbarDropdown } from './line-height/LineHeightToolbarDropdown';
import { LinkToolbarButton } from './link/LinkToolbarButton';
import { ListToolbarButtons } from './list/ListToolbarButtons';
import { insertMedia } from './media/insertMedia';
import { TableDropdownMenu } from './table/TableDropdownMenu';
import { MarkToolbarButton } from './toolbar/MarkToolbarButton';
import { TurnIntoDropdownMenu } from './toolbar/TurnIntoDropdownMenu';
import { InsertDropdownMenu } from './InsertDropdownMenu';
import { ModeDropdownMenu } from './ModeDropdownMenu';
import { MoreDropdownMenu } from './MoreDropdownMenu';

import { Icons, iconVariants } from '@/components/icons';
import { ToolbarSeparator } from '@/components/ui/toolbar';
import { ToolbarButton } from '@/components/ui/toolbar-button';

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

            <ListToolbarButtons />
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
