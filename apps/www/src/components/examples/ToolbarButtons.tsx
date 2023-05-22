import React from 'react';
import { TippyProps } from '@tippyjs/react';
import { KEY_EMOJI, MARK_BG_COLOR, MARK_COLOR } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { AlignToolbarButtons } from '@/plate/align/AlignToolbarButtons';
import { BasicElementToolbarButtons } from '@/plate/basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from '@/plate/basic-marks/BasicMarkToolbarButtons';
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
      <ListToolbarButtons />
      <IndentToolbarButtons />
      <BasicMarkToolbarButtons />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_COLOR}
        icon={<Icons.color />}
        selectedIcon={<Icons.check />}
        tooltip={colorTooltip}
      />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_BG_COLOR}
        icon={<Icons.bg />}
        selectedIcon={<Icons.check />}
        tooltip={bgTooltip}
      />
      <EmojiToolbarDropdown
        tooltip={emojiTooltip}
        pluginKey={KEY_EMOJI}
        icon={<Icons.emoji />}
      />
      <LineHeightToolbarDropdown
        tooltip={lineHeightTooltip}
        icon={<Icons.lineHeight />}
      />
      <AlignToolbarButtons />
      <LinkToolbarButton icon={<Icons.link />} />
      <ImageToolbarButton icon={<Icons.image />} />
      <MediaEmbedToolbarButton icon={<Icons.embed />} />
      <TableToolbarButtons />
      <ExcalidrawElementToolbarButton />
    </>
  );
}
