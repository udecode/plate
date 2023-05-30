import React from 'react';
import {
  ELEMENT_IMAGE,
  ELEMENT_OL,
  ELEMENT_UL,
  MARK_BG_COLOR,
  MARK_BOLD,
  MARK_CODE,
  MARK_COLOR,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  usePlateReadOnly,
} from '@udecode/plate';
import { InsertDropdownMenu } from './insert-dropdown-menu';
import { MediaToolbarButton } from './MediaToolbarButton';
import { MoreDropdownMenu } from './more-dropdown-menu';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';

import { Icons, iconVariants } from '@/components/icons';
import { ToolbarSeparator } from '@/components/ui/toolbar';
import { MarkToolbarButton } from '@/plate/aui/mark-toolbar-button';
import { TableDropdownMenu } from '@/plate/aui/table-dropdown-menu';
import { AlignDropdownMenu } from '@/plate/bcomponents/align-dropdown-menu';
import { CommentToolbarButton } from '@/plate/bcomponents/comments/comment-toolbar-button';
import { EmojiDropdownMenu } from '@/plate/bcomponents/emoji/EmojiDropdownMenu';
import { ColorDropdownMenu } from '@/plate/bcomponents/font/ColorDropdownMenu';
import { IndentToolbarButton } from '@/plate/bcomponents/indent-toolbar-button';
import { LinkToolbarButton } from '@/plate/bcomponents/link-toolbar-button';
import { ListToolbarButton } from '@/plate/bcomponents/list-toolbar-button';
import { ModeDropdownMenu } from '@/plate/bcomponents/mode-dropdown-menu';
import { OutdentToolbarButton } from '@/plate/bcomponents/OutdentToolbarButton';
import { UserToolbarDropdown } from '@/plate/bcomponents/SuggestionToolbarDropdown';
import { LineHeightDropdownMenu } from '@/plate/line-height/LineHeightDropdownMenu';

export function HeadingToolbarButtons() {
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

            <ColorDropdownMenu nodeType={MARK_COLOR} tooltip="Text Color">
              <Icons.color className={iconVariants({ variant: 'toolbar' })} />
            </ColorDropdownMenu>
            <ColorDropdownMenu
              nodeType={MARK_BG_COLOR}
              tooltip="Highlight Color"
            >
              <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
            </ColorDropdownMenu>

            <ToolbarSeparator />

            <AlignDropdownMenu />

            <LineHeightDropdownMenu />

            <ListToolbarButton nodeType={ELEMENT_UL} />
            <ListToolbarButton nodeType={ELEMENT_OL} />

            <OutdentToolbarButton />
            <IndentToolbarButton />

            <ToolbarSeparator />

            <LinkToolbarButton />

            <MediaToolbarButton nodeType={ELEMENT_IMAGE} />

            <TableDropdownMenu />
            <EmojiDropdownMenu />
            <MoreDropdownMenu />
          </>
        )}
      </div>

      <div className="flex gap-1">
        <UserToolbarDropdown />
        <CommentToolbarButton />
        <ModeDropdownMenu />
      </div>
    </>
  );
}
