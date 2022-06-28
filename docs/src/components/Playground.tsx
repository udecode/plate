import React, { useCallback, useRef } from 'react';
import { cursorStore } from '@example/config/plugins';
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
import { user } from '../user';

export function Playground({
  containerRef,
}: {
  containerRef: React.MutableRefObject<HTMLDivElement>;
}) {
  const retrieveUser = useCallback(function retrieveUser() {
    return { ...user };
  }, []);

  const {
    thread,
    position: threadPosition,
    onAddThread,
    onSaveComment,
    onSubmitComment,
    onCancelCreateThread,
  } = useComments({ retrieveUser });

  const fetchContacts = useCallback(function fetchContacts() {
    return [
      {
        id: '1',
        name: 'Jon Doe',
        email: 'jon.doe@example.com',
        avatarUrl: '/img/avatar.svg',
      },
      {
        id: '2',
        name: 'Jon Doe2',
        email: 'jon.doe2@example.com',
        avatarUrl: '/img/avatar.svg',
      },
      {
        id: '3',
        name: 'Jon Doe3',
        email: 'jon.doe3@example.com',
        avatarUrl: '/img/avatar.svg',
      },
    ];
  }, []);

  const CursorOverlayContainer = (props) => {
    const cursors = cursorStore.use.cursors();

    return <CursorOverlay {...props} cursors={cursors} />;
  };

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
        <CollaborationToolbarButtons
          onAddThread={onAddThread}
          fetchContacts={fetchContacts}
        />
      </HeadingToolbar>

      <BallonToolbarMarks />

      <MentionCombobox items={CONFIG.mentionItems} />

      <CursorOverlayContainer containerRef={containerRef} />

      {thread ? (
        <SideThread
          thread={thread}
          position={threadPosition}
          onSaveComment={onSaveComment}
          onSubmitComment={onSubmitComment}
          onCancelCreateThread={onCancelCreateThread}
          fetchContacts={fetchContacts}
          retrieveUser={retrieveUser}
        />
      ) : null}
    </>
  );
}
