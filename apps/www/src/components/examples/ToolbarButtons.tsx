import React from 'react';
import { TippyProps } from '@tippyjs/react';
import { KEY_EMOJI, MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate';

import { Icons, iconVariants } from '@/components/icons';
import { ToolbarSeparator } from '@/components/ui/toolbar';
import { AlignToolbarButtons } from '@/plate/align/AlignToolbarButtons';
import { BasicElementToolbarButtons } from '@/plate/basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from '@/plate/basic-marks/BasicMarkToolbarButtons';
import { PlateCommentToolbarButton } from '@/plate/comments/PlateCommentToolbarButton';
import { EmojiToolbarDropdown } from '@/plate/emoji/EmojiToolbarDropdown';
import { ExcalidrawElementToolbarButton } from '@/plate/excalidraw/ExcalidrawElementToolbarButton';
import { ColorPickerToolbarDropdown } from '@/plate/font/ColorPickerToolbarDropdown';
import { IndentToolbarButtons } from '@/plate/indent/IndentToolbarButtons';
import { LineHeightToolbarDropdown } from '@/plate/line-height/LineHeightToolbarDropdown';
import { LinkToolbarButton } from '@/plate/link/LinkToolbarButton';
import { ListToolbarButtons } from '@/plate/list/ListToolbarButtons';
import { ImageToolbarButton } from '@/plate/media/ImageToolbarButton';
import { MediaEmbedToolbarButton } from '@/plate/media/MediaEmbedToolbarButton';
import { TableToolbarButtons } from '@/plate/table/TableToolbarButtons';

export function ToolbarButtons() {
  const colorTooltip: TippyProps = { content: 'Text Color' };
  const bgTooltip: TippyProps = { content: 'Background Color' };
  const emojiTooltip: TippyProps = { content: 'Emoji' };
  const lineHeightTooltip: TippyProps = { content: 'Line Height' };

  return (
    <>
      <BasicElementToolbarButtons />

      <ToolbarSeparator />

      <BasicMarkToolbarButtons />

      <ToolbarSeparator />

      <LineHeightToolbarDropdown
        tooltip={lineHeightTooltip}
        icon={<Icons.lineHeight />}
      />

      <ColorPickerToolbarDropdown
        pluginKey={MARK_COLOR}
        icon={<Icons.color className={iconVariants({ variant: 'toolbar' })} />}
        tooltip={colorTooltip}
      />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_BG_COLOR}
        icon={<Icons.bg className={iconVariants({ variant: 'toolbar' })} />}
        tooltip={bgTooltip}
      />

      <ToolbarSeparator />

      <AlignToolbarButtons />

      <ToolbarSeparator />

      <ListToolbarButtons />
      <IndentToolbarButtons />

      <ToolbarSeparator />

      <LinkToolbarButton icon={<Icons.link />} />
      <ImageToolbarButton icon={<Icons.image />} />
      <MediaEmbedToolbarButton icon={<Icons.embed />} />
      <ExcalidrawElementToolbarButton />
      <TableToolbarButtons />
      <EmojiToolbarDropdown
        tooltip={emojiTooltip}
        pluginKey={KEY_EMOJI}
        icon={<Icons.emoji />}
      />

      <ToolbarSeparator />

      <PlateCommentToolbarButton icon={<Icons.comment />} />
    </>
  );
}
