import React from 'react';
import { User } from '@udecode/plate-comments';
import { usePlateEditorState } from '@udecode/plate-core';
import { findThreadNodeEntries } from '../../../../../comments/src/queries';
import { nullUser } from '../../utils';
import { PlateThread } from '../Thread/PlateThread';
import {
  resolvedThreadsBodyCss,
  resolvedThreadsHeaderCss,
  resolvedThreadsRootCss,
} from './styles';

export type PlateResolvedThreadsProps = {
  fetchContacts: () => User[];
  retrieveUser: () => User;
};

export const PlateResolvedThreads = (props: PlateResolvedThreadsProps) => {
  const { fetchContacts, retrieveUser } = props;

  const editor = usePlateEditorState()!;

  const threadNodeEntries = findThreadNodeEntries(editor);

  const resolvedThreads = threadNodeEntries
    .map(([threadNodeEntry]) => threadNodeEntry.thread)
    .filter((thread) => {
      return thread.isResolved;
    });

  return (
    <div css={resolvedThreadsRootCss}>
      <h2 css={resolvedThreadsHeaderCss}>Resolved threads</h2>
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
            noTextArea
          />
        ))}
      </div>
    </div>
  );
};
