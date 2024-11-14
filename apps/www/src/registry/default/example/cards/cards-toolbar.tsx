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
import { ListStyleType } from '@udecode/plate-indent-list';
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
import { MediaDropdownMenu } from '@/registry/default/plate-ui/media-toolbar-button';
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

            <IndentListToolbarButton nodeType={ListStyleType.Disc} />
            <IndentListToolbarButton nodeType={ListStyleType.Decimal} />

            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MediaDropdownMenu nodeType={ImagePlugin.key} />
            <MediaDropdownMenu nodeType={VideoPlugin.key} />
            <MediaDropdownMenu nodeType={AudioPlugin.key} />
            <MediaDropdownMenu nodeType={FilePlugin.key} />
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
