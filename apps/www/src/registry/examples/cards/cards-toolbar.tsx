'use client';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from '@udecode/plate-font/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import {
  BaselineIcon,
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  PaintBucketIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';

import { AlignDropdownMenu } from '@/registry/ui/align-dropdown-menu';
import { ColorDropdownMenu } from '@/registry/ui/color-dropdown-menu';
import { CommentToolbarButton } from '@/registry/ui/comment-toolbar-button';
import { EmojiDropdownMenu } from '@/registry/ui/emoji-dropdown-menu';
import { FixedToolbar } from '@/registry/ui/fixed-toolbar';
import {
  BulletedIndentListToolbarButton,
  NumberedIndentListToolbarButton,
} from '@/registry/ui/indent-list-toolbar-button';
import { IndentToolbarButton } from '@/registry/ui/indent-toolbar-button';
import { InsertDropdownMenu } from '@/registry/ui/insert-dropdown-menu';
import { LineHeightDropdownMenu } from '@/registry/ui/line-height-dropdown-menu';
import { LinkToolbarButton } from '@/registry/ui/link-toolbar-button';
import { MarkToolbarButton } from '@/registry/ui/mark-toolbar-button';
import { MediaToolbarButton } from '@/registry/ui/media-toolbar-button';
import { ModeDropdownMenu } from '@/registry/ui/mode-dropdown-menu';
import { MoreDropdownMenu } from '@/registry/ui/more-dropdown-menu';
import { OutdentToolbarButton } from '@/registry/ui/outdent-toolbar-button';
import { TableDropdownMenu } from '@/registry/ui/table-dropdown-menu';
import { ToggleToolbarButton } from '@/registry/ui/toggle-toolbar-button';
import { ToolbarGroup } from '@/registry/ui/toolbar';
import { TurnIntoDropdownMenu } from '@/registry/ui/turn-into-dropdown-menu';

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
          <ToolbarGroup>
            <InsertDropdownMenu />
            <TurnIntoDropdownMenu />
          </ToolbarGroup>

          <ToolbarGroup>
            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
              <BoldIcon />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (⌘+I)"
            >
              <ItalicIcon />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip="Underline (⌘+U)"
            >
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={StrikethroughPlugin.key}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <StrikethroughIcon />
            </MarkToolbarButton>
            <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
              <Code2Icon />
            </MarkToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ColorDropdownMenu
              nodeType={FontColorPlugin.key}
              tooltip="Text Color"
            >
              <BaselineIcon />
            </ColorDropdownMenu>
            <ColorDropdownMenu
              nodeType={FontBackgroundColorPlugin.key}
              tooltip="Highlight Color"
            >
              <PaintBucketIcon />
            </ColorDropdownMenu>
          </ToolbarGroup>

          <ToolbarGroup>
            <AlignDropdownMenu />

            <LineHeightDropdownMenu />

            <BulletedIndentListToolbarButton />
            <NumberedIndentListToolbarButton />

            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MediaToolbarButton nodeType={ImagePlugin.key} />
            <MediaToolbarButton nodeType={VideoPlugin.key} />
            <MediaToolbarButton nodeType={AudioPlugin.key} />
            <MediaToolbarButton nodeType={FilePlugin.key} />
          </ToolbarGroup>

          <ToolbarGroup>
            <LinkToolbarButton />

            <ToggleToolbarButton />

            <TableDropdownMenu />

            <EmojiDropdownMenu />

            <MoreDropdownMenu />
          </ToolbarGroup>

          <div className="grow" />

          <ToolbarGroup>
            <CommentToolbarButton />
            <ModeDropdownMenu />
          </ToolbarGroup>
        </div>
      </div>
    </FixedToolbar>
  );
}
