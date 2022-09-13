import React, { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Contact, Thread, User } from '../../utils';
import { PlateThread } from '../Thread/PlateThread';
import { ResolvedThread } from './ResolvedThreads';
import { ResolveThreadsPosition } from './ResolvedThreadsRoot';
import { resolvedThreadsCss, resolvedThreadsRootCss } from './styles';

export type PlateResolvedThreadsProps = {
  onClose: () => void;
  position: ResolveThreadsPosition;
  resolvedThreads: Thread[];
  retrieveUser: () => User;
  fetchContacts: () => Contact[];
  parentRef: RefObject<HTMLElement>;
  onReOpenThread?: () => void;
};

export const PlateResolvedThreads = (props: PlateResolvedThreadsProps) => {
  const { resolvedThreads } = props;

  return createPortal(
    <ResolvedThread.Root
      {...props}
      css={resolvedThreadsRootCss}
      className="threads"
    >
      <h2>Resolved threads</h2>
      <div css={resolvedThreadsCss}>
        {resolvedThreads.map((thread) => (
          <PlateThread
            key={thread.id}
            thread={thread}
            showReOpenThreadButton
            showResolveThreadButton={false}
            showMoreButton={false}
            noHeader
            noActions
            // a hacky fix to resolve typescript errors
            value=""
            {...props}
          />
        ))}
      </div>
    </ResolvedThread.Root>,
    document.body
  );
};
