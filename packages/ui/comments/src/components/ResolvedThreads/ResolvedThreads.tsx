import React from 'react';
import { createPortal } from 'react-dom';
import { createNullUser } from '@udecode/plate-comments';
import { Thread } from '../Thread/Thread';
import { createResolvedThreadsStyles } from './ResolvedThreads.styles';
import { ResolvedThreadsStyleProps } from './ResolvedThreads.types';
import { useResolvedThreads } from './useResolvedThreads';

export const ResolvedThreads = (props: ResolvedThreadsStyleProps) => {
  const {
    fetchContacts,
    position,
    ref,
    renderContainer,
    resolvedThreads,
    retrieveUser,
  } = useResolvedThreads(props);

  const styles = createResolvedThreadsStyles(props);

  return createPortal(
    <div
      ref={ref}
      css={styles.root.css}
      className={`${styles.root.className} threads`}
      style={{ ...position }}
    >
      <h2 css={styles.header?.css} className={styles.header?.className}>
        Resolved threads
      </h2>
      <div css={styles.body?.css} className={styles.body?.className}>
        {resolvedThreads.map((thread) => (
          <Thread
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
            retrieveUserByEmailAddress={() => createNullUser()}
          />
        ))}
      </div>
    </div>,
    renderContainer
  );
};
