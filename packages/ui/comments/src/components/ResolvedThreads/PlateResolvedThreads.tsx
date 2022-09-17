import React, { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { usePlateEditorState } from '@udecode/plate-core';
import { findThreadNodeEntries } from '../../queries';
import { User } from '../../types';
import { nullUser } from '../../utils';
import { PlateThread } from '../Thread/PlateThread';
import { ResolvedThreads } from './ResolvedThreads';
import {
  resolvedThreadsBodyCss,
  resolvedThreadsHeaderCss,
  resolvedThreadsRootCss,
} from './styles';

type PlateResolvedThreadsProps = {
  fetchContacts: () => User[];
  onClose: () => void;
  parent: RefObject<HTMLElement>;
  retrieveUser: () => User;
};

export const PlateResolvedThreads = (props: PlateResolvedThreadsProps) => {
  const { fetchContacts, retrieveUser } = props;

  const editor = usePlateEditorState()!;

  const threadNodeEntries = Array.from(findThreadNodeEntries(editor));

  const resolvedThreads = threadNodeEntries
    .map(([threadNodeEntry]) => threadNodeEntry.thread)
    .filter((thread) => {
      return thread.isResolved;
    });

  return createPortal(
    <ResolvedThreads.Root
      {...props}
      css={resolvedThreadsRootCss}
      className="threads"
    >
      <div css={resolvedThreadsHeaderCss}>
        <h2>Resolved threads</h2>
      </div>
      <div css={resolvedThreadsBodyCss}>
        {resolvedThreads.map((thread) => (
          <PlateThread
            key={thread.id}
            thread={thread}
            onSaveComment={() => undefined as any}
            onSubmitComment={() => Promise.resolve() as any}
            onCancelCreateThread={() => undefined}
            onResolveThread={() => undefined}
            showResolveThreadButton={false}
            showReOpenThreadButton
            showMoreButton={false}
            fetchContacts={fetchContacts}
            retrieveUser={retrieveUser}
            retrieveUserByEmailAddress={() => nullUser}
          />
        ))}
      </div>
    </ResolvedThreads.Root>,
    document.body
  );
};
