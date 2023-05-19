import React from 'react';
import { TippyProps } from '@tippyjs/react';
import {
  ColorPickerToolbarDropdown,
  EmojiToolbarDropdown,
  ImageToolbarButton,
  KEY_EMOJI,
  LineHeightToolbarDropdown,
  LinkToolbarButton,
  MARK_BG_COLOR,
  MARK_COLOR,
  MediaEmbedToolbarButton,
} from '@udecode/plate';
import { AlignToolbarButtons } from './align/AlignToolbarButtons';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { BasicMarkToolbarButtons } from './basic-marks/BasicMarkToolbarButtons';
import { Icons } from './common/icons';
import { ExcalidrawElementToolbarButton } from './excalidraw/ExcalidrawElementToolbarButton';
import { IndentToolbarButtons } from './indent/IndentToolbarButtons';
import { ListToolbarButtons } from './list/ListToolbarButtons';
import { TableToolbarButtons } from './table/TableToolbarButtons';

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
