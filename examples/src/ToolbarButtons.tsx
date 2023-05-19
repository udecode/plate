import React from 'react';
import { Check } from '@styled-icons/material/Check';
import { EmojiEmotions } from '@styled-icons/material/EmojiEmotions';
import { FontDownload } from '@styled-icons/material/FontDownload';
import { FormatColorText } from '@styled-icons/material/FormatColorText';
import { Image } from '@styled-icons/material/Image';
import { LineWeight } from '@styled-icons/material/LineWeight';
import { Link } from '@styled-icons/material/Link';
import { OndemandVideo } from '@styled-icons/material/OndemandVideo';
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
        icon={<FormatColorText />}
        selectedIcon={<Check />}
        tooltip={colorTooltip}
      />
      <ColorPickerToolbarDropdown
        pluginKey={MARK_BG_COLOR}
        icon={<FontDownload />}
        selectedIcon={<Check />}
        tooltip={bgTooltip}
      />
      <EmojiToolbarDropdown
        tooltip={emojiTooltip}
        pluginKey={KEY_EMOJI}
        icon={<EmojiEmotions />}
      />
      <LineHeightToolbarDropdown
        tooltip={lineHeightTooltip}
        icon={<LineWeight />}
      />
      <AlignToolbarButtons />
      <LinkToolbarButton icon={<Link />} />
      <ImageToolbarButton icon={<Image />} />
      <MediaEmbedToolbarButton icon={<OndemandVideo />} />
      <TableToolbarButtons />
      <ExcalidrawElementToolbarButton />
    </>
  );
}
