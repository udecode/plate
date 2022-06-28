import React, { useCallback, useEffect } from 'react';
import { MarkBallonToolbar as BallonToolbarMarks } from '@example/config/components/Toolbars';
import { CONFIG } from '@example/config/config';
import { cursorStore } from '@example/config/plugins';
import { CursorOverlay, MentionCombobox } from '@udecode/plate';
import { useEditorRef } from '@udecode/plate-core';
import { User } from '@xolvio/plate-comments';
import {
  OnAddThread,
  SideThread,
  useComments,
} from '@xolvio/plate-ui-comments';
import { user } from '../user';
import { useFetchContacts } from './useFetchContacts';

const userMap = new Map([[user.email, user]]);

export function Playground({
  containerRef,
  setOnAddThread,
}: {
  containerRef: React.MutableRefObject<HTMLDivElement>;
  setOnAddThread: React.Dispatch<React.SetStateAction<OnAddThread>>;
}) {
  // @ts-ignore
  window.editor = useEditorRef();

  const retrieveUser = useCallback(function retrieveUser() {
    return { ...user };
  }, []);

  const retrieveUserByEmailAddress = useCallback(
    function retrieveUserByEmailAddress(emailAddress: string): User | null {
      return userMap.get(emailAddress) ?? null;
    },
    []
  );

  const {
    thread,
    position: threadPosition,
    onAddThread,
    onSaveComment,
    onSubmitComment,
    onCancelCreateThread,
  } = useComments({ retrieveUser });

  useEffect(
    function setSetOnAddThread() {
      setOnAddThread(() => onAddThread);
    },
    [setOnAddThread, onAddThread]
  );

  const fetchContacts = useFetchContacts();

  const CursorOverlayContainer = (props) => {
    const cursors = cursorStore.use.cursors();

    return <CursorOverlay {...props} cursors={cursors} />;
  };

  return (
    <>
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
          retrieveUserByEmailAddress={retrieveUserByEmailAddress}
        />
      ) : null}
    </>
  );
}
