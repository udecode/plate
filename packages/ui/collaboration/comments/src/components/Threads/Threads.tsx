import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { usePlateEditorRef } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { createNullUser, findThreadNodeEntries } from '@xolvio/plate-comments';
import { FetchContacts, RetrieveUser, ThreadPosition } from '../../types';
import { determineAbsolutePosition } from '../../utils/determineAbsolutePosition';
import { Thread } from '../Thread/Thread';
import {
  createBodyStyles,
  createHeaderStyles,
  createThreadsStyles,
} from './Threads.styles';

function wasClickOnTargetInsideThreads(event: MouseEvent): boolean {
  const closestThreadsParent =
    event.target &&
    (event.target as any).closest &&
    (event.target as any).closest('.threads');
  return Boolean(closestThreadsParent);
}

export function Threads(
  props: {
    parent: RefObject<HTMLElement>;
    onClose: () => void;
    fetchContacts: FetchContacts;
    retrieveUser: RetrieveUser;
  } & StyledProps
) {
  const editor = usePlateEditorRef()!;
  const { parent, onClose, fetchContacts, retrieveUser } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<ThreadPosition | null>(null);

  useEffect(() => {
    const parentElement = parent.current!;
    const newPosition = determineAbsolutePosition(parentElement);
    newPosition.top += parentElement.clientHeight;
    newPosition.left =
      newPosition.left -
      0.5 * ref.current!.clientWidth +
      0.5 * parentElement.clientWidth;
    setPosition(newPosition);
  }, [parent]);

  const { root } = createThreadsStyles(props);
  const { root: header } = createHeaderStyles(props);
  const { root: body } = createBodyStyles(props);

  const threadNodeEntries = Array.from(findThreadNodeEntries(editor));
  const threads = threadNodeEntries.map(
    (threadNodeEntry) => threadNodeEntry[0].thread
  );
  const resolvedThreads = threads.filter((thread) => thread.isResolved);

  const onClick = useCallback(
    function onClick(event: MouseEvent) {
      if (!wasClickOnTargetInsideThreads(event)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(
    function registerOnClick() {
      let isMounted = true;

      setTimeout(() => {
        if (isMounted) {
          document.body.addEventListener('click', onClick);
        }
      }, 400);

      return () => {
        document.body.removeEventListener('click', onClick);
        isMounted = false;
      };
    },
    [onClick]
  );

  return ReactDOM.createPortal(
    <div
      ref={ref}
      css={root.css}
      className={`${root.className} threads`}
      style={{ ...position }}
    >
      <div css={header.css} className={header.className}>
        <h2>Resolved threads</h2>
      </div>
      <div css={body.css} className={body.className}>
        {resolvedThreads.map((thread) => {
          return (
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
          );
        })}
      </div>
    </div>,
    document.body
  );
}
