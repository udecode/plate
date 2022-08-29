import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useHotkeys, usePlateEditorRef } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { createNullUser, findThreadNodeEntries } from '@udecode/plate-comments';
import { FetchContacts, RetrieveUser, ThreadPosition } from '../../types';
import { determineAbsolutePosition } from '../../utils/determineAbsolutePosition';
import { Thread } from '../Thread/Thread';
import {
  createBodyStyles,
  createHeaderStyles,
  createThreadsStyles,
} from './ResolvedThreads.styles';

const isClickInsideThreads = (event: MouseEvent): boolean => {
  const target = event.target as HTMLElement;
  return Boolean(target && target.closest && target.closest('.threads'));
};

type ResolvedThreadsProps = {
  renderContainer: HTMLElement;
  fetchContacts: FetchContacts;
  onClose: () => void;
  parent: RefObject<HTMLElement>;
  retrieveUser: RetrieveUser;
} & StyledProps;

export const ResolvedThreads = (props: ResolvedThreadsProps) => {
  const {
    fetchContacts,
    onClose,
    parent,
    renderContainer,
    retrieveUser,
  } = props;

  const [position, setPosition] = useState<ThreadPosition | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  const editor = usePlateEditorRef()!;

  const { root } = createThreadsStyles(props);
  const { root: header } = createHeaderStyles(props);
  const { root: body } = createBodyStyles(props);

  useHotkeys('escape', () => onClose(), {
    enableOnTags: ['INPUT'],
    enableOnContentEditable: true,
  });

  const resolvedThreads = useMemo(() => {
    return Array.from(findThreadNodeEntries(editor))
      .map((threadNodeEntry) => threadNodeEntry[0].thread)
      .filter((thread) => thread.isResolved);
  }, [editor]);

  const onClick = useCallback(
    (event: MouseEvent) => {
      if (!isClickInsideThreads(event)) {
        onClose();
      }
    },
    [onClose]
  );

  const updatePosition = useCallback(() => {
    const parentElement = parent.current!;
    const newPosition = determineAbsolutePosition(parentElement);
    newPosition.top += parentElement.clientHeight;
    newPosition.left =
      newPosition.left -
      0.5 * ref.current!.clientWidth +
      0.5 * parentElement.clientWidth;
    setPosition(newPosition);
  }, [parent]);

  useEffect(() => {
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
  }, [onClick]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  return createPortal(
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
