import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findThreadNodeEntries } from '@udecode/plate-comments';
import { useHotkeys, usePlateEditorRef } from '@udecode/plate-core';
import { ThreadPosition } from '../../types';
import { determineAbsolutePosition } from '../../utils/determineAbsolutePosition';
import { ResolvedThreadsProps } from './ResolvedThreads.types';

const isClickInsideThreads = (event: MouseEvent): boolean => {
  const target = event.target as HTMLElement;
  return Boolean(target && target.closest && target.closest('.threads'));
};

export const useResolvedThreads = (props: ResolvedThreadsProps) => {
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

  return {
    fetchContacts,
    position,
    ref,
    renderContainer,
    resolvedThreads,
    retrieveUser,
  } as const;
};
