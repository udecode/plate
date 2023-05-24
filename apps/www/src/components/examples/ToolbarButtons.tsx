import React from 'react';
import { KEY_EMOJI, MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate';

import { Icons, iconVariants } from '@/components/icons';
import { ToolbarSeparator } from '@/components/ui/toolbar';
import { AlignDropdownMenu } from '@/plate/align/AlignDropdownMenu';
import { BasicElementToolbarButtons } from '@/plate/basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from '@/plate/basic-marks/BasicMarkToolbarButtons';
import { PlateCommentToolbarButton } from '@/plate/comments/PlateCommentToolbarButton';
import { EmojiDropdownMenu } from '@/plate/emoji/EmojiDropdownMenu';
import { ExcalidrawElementToolbarButton } from '@/plate/excalidraw/ExcalidrawElementToolbarButton';
import { ColorDropdownMenu } from '@/plate/font/ColorDropdownMenu';
import { IndentToolbarButtons } from '@/plate/indent/IndentToolbarButtons';
import { LineHeightToolbarDropdown } from '@/plate/line-height/LineHeightToolbarDropdown';
import { LinkToolbarButton } from '@/plate/link/LinkToolbarButton';
import { ListToolbarButtons } from '@/plate/list/ListToolbarButtons';
import { ImageToolbarButton } from '@/plate/media/ImageToolbarButton';
import { MediaEmbedToolbarButton } from '@/plate/media/MediaEmbedToolbarButton';
import { TableToolbarButtons } from '@/plate/table/TableToolbarButtons';

export function ToolbarButtons() {
  return (
    <>
      <BasicElementToolbarButtons />

      <ToolbarSeparator />

      <BasicMarkToolbarButtons />

      <ToolbarSeparator />

      <LineHeightToolbarDropdown tooltip="Line Height">
        <Icons.lineHeight />
      </LineHeightToolbarDropdown>

      <ColorDropdownMenu pluginKey={MARK_COLOR} tooltip="Text Color">
        <Icons.color className={iconVariants({ variant: 'toolbar' })} />
      </ColorDropdownMenu>
      <ColorDropdownMenu pluginKey={MARK_BG_COLOR} tooltip="Highlight Color">
        <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
      </ColorDropdownMenu>

      <ToolbarSeparator />

      <AlignDropdownMenu />

      <ToolbarSeparator />

      <ListToolbarButtons />
      <IndentToolbarButtons />

      <ToolbarSeparator />

      <LinkToolbarButton>
        <Icons.link />
      </LinkToolbarButton>
      <ImageToolbarButton>
        <Icons.image />
      </ImageToolbarButton>
      <MediaEmbedToolbarButton>
        <Icons.embed />
      </MediaEmbedToolbarButton>
      <ExcalidrawElementToolbarButton />
      <TableToolbarButtons />
      <EmojiDropdownMenu tooltip="Emoji" pluginKey={KEY_EMOJI}>
        <Icons.emoji />
      </EmojiDropdownMenu>

      <ToolbarSeparator />

      <PlateCommentToolbarButton>
        <Icons.comment />
      </PlateCommentToolbarButton>
    </>
  );
}
