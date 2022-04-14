import React from 'react';
import {
  Check,
  FontDownload,
  FormatColorText,
  LineWeight,
  Link,
  OndemandVideo,
} from '@styled-icons/material';
import { Image } from '@styled-icons/material/Image';
import {
  ColorPickerToolbarDropdown,
  HeadingToolbar,
  ImageToolbarButton,
  LineHeightToolbarDropdown,
  LinkToolbarButton,
  MARK_BG_COLOR,
  MARK_COLOR,
  MediaEmbedToolbarButton,
  MentionCombobox,
  SideThread,
  useComments,
} from '@udecode/plate';
import {
  AlignToolbarButtons,
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  CollaborationToolbarButtons,
  IndentToolbarButtons,
  ListToolbarButtons,
  MarkBallonToolbar as BallonToolbarMarks,
  TableToolbarButtons,
} from '../live/config/components/Toolbars';
import { CONFIG } from '../live/config/config';

export function Playground() {
  const {
    thread,
    position: threadPosition,
    onAddThread,
    onSubmitComment,
    onCancelCreateThread,
  } = useComments();

  return (
    <>
      <HeadingToolbar>
        <BasicElementToolbarButtons />
        <ListToolbarButtons />
        <IndentToolbarButtons />
        <BasicMarkToolbarButtons />
        <ColorPickerToolbarDropdown
          pluginKey={MARK_COLOR}
          icon={<FormatColorText />}
          selectedIcon={<Check />}
          tooltip={{ content: 'Text color' }}
        />
        <ColorPickerToolbarDropdown
          pluginKey={MARK_BG_COLOR}
          icon={<FontDownload />}
          selectedIcon={<Check />}
          tooltip={{ content: 'Highlight color' }}
        />
        <AlignToolbarButtons />
        <LineHeightToolbarDropdown icon={<LineWeight />} />
        <LinkToolbarButton icon={<Link />} />
        <ImageToolbarButton icon={<Image />} />
        <MediaEmbedToolbarButton icon={<OndemandVideo />} />
        <TableToolbarButtons />
        <CollaborationToolbarButtons onAddThread={onAddThread} />
      </HeadingToolbar>

      <BallonToolbarMarks />

      <MentionCombobox items={CONFIG.mentionItems} />

      {thread ? (
        <SideThread
          thread={thread}
          position={threadPosition}
          onSubmitComment={onSubmitComment}
          onCancelCreateThread={onCancelCreateThread}
        />
      ) : null}
    </>
  );
}
