'use client';

import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate-font';
import { ListStyleType } from '@udecode/plate-indent-list';
import { ELEMENT_IMAGE } from '@udecode/plate-media';

import { Icons, iconVariants } from '@/components/icons';
import { AlignDropdownMenu } from '@/registry/default/plate-ui/align-dropdown-menu';
import { ColorDropdownMenu } from '@/registry/default/plate-ui/color-dropdown-menu';
import { CommentToolbarButton } from '@/registry/default/plate-ui/comment-toolbar-button';
import { EmojiDropdownMenu } from '@/registry/default/plate-ui/emoji-dropdown-menu';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { IndentListToolbarButton } from '@/registry/default/plate-ui/indent-list-toolbar-button';
import { IndentToolbarButton } from '@/registry/default/plate-ui/indent-toolbar-button';
import { InsertDropdownMenu } from '@/registry/default/plate-ui/insert-dropdown-menu';
import { LineHeightDropdownMenu } from '@/registry/default/plate-ui/line-height-dropdown-menu';
import { LinkToolbarButton } from '@/registry/default/plate-ui/link-toolbar-button';
import { MarkToolbarButton } from '@/registry/default/plate-ui/mark-toolbar-button';
import { MediaToolbarButton } from '@/registry/default/plate-ui/media-toolbar-button';
import { ModeDropdownMenu } from '@/registry/default/plate-ui/mode-dropdown-menu';
import { MoreDropdownMenu } from '@/registry/default/plate-ui/more-dropdown-menu';
import { OutdentToolbarButton } from '@/registry/default/plate-ui/outdent-toolbar-button';
import { TableDropdownMenu } from '@/registry/default/plate-ui/table-dropdown-menu';
import { ToggleToolbarButton } from '@/registry/default/plate-ui/toggle-toolbar-button';
import { ToolbarGroup } from '@/registry/default/plate-ui/toolbar';
import { TurnIntoDropdownMenu } from '@/registry/default/plate-ui/turn-into-dropdown-menu';

export function CardsToolbar() {
  return (
    <FixedToolbar>
      <div className="w-full overflow-hidden">
        <div
          className="flex flex-wrap"
          style={{
            transform: 'translateX(calc(-1px))',
          }}
        >
          <ToolbarGroup noSeparator>
            <InsertDropdownMenu />
            <TurnIntoDropdownMenu />
          </ToolbarGroup>

          <ToolbarGroup>
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
          </ToolbarGroup>

          <ToolbarGroup>
            <ColorDropdownMenu nodeType={MARK_COLOR} tooltip="Text Color">
              <Icons.color className={iconVariants({ variant: 'toolbar' })} />
            </ColorDropdownMenu>
            <ColorDropdownMenu
              nodeType={MARK_BG_COLOR}
              tooltip="Highlight Color"
            >
              <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
            </ColorDropdownMenu>
          </ToolbarGroup>

          <ToolbarGroup>
            <AlignDropdownMenu />

            <LineHeightDropdownMenu />

            <IndentListToolbarButton nodeType={ListStyleType.Disc} />
            <IndentListToolbarButton nodeType={ListStyleType.Decimal} />

            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <LinkToolbarButton />

            <ToggleToolbarButton />

            <MediaToolbarButton nodeType={ELEMENT_IMAGE} />

            <TableDropdownMenu />

            <EmojiDropdownMenu />

            <MoreDropdownMenu />
          </ToolbarGroup>

          <div className="grow" />

          <ToolbarGroup noSeparator>
            <CommentToolbarButton />
            <ModeDropdownMenu />
          </ToolbarGroup>
        </div>
      </div>
    </FixedToolbar>
  );
}
