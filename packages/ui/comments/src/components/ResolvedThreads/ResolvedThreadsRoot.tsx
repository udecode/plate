import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useHotkeys,
} from '@udecode/plate-core';
import { ThreadPosition } from '../../types';
import { determineAbsolutePosition, isClickInsideThreads } from '../../utils';

export type ResolvedThreadsRootProps = {
  onClose: () => void;
  parent: RefObject<HTMLElement>;
} & HTMLPropsAs<'div'>;

export const useResolvedThreadsRoot = (
  props: ResolvedThreadsRootProps
): HTMLPropsAs<'div'> => {
  const { onClose, parent } = props;

  const [position, setPosition] = useState<ThreadPosition | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useHotkeys('escape', () => onClose(), {
    enableOnTags: ['INPUT'],
    enableOnContentEditable: true,
  });

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

  return { ...props, ref, style: { ...position } };
};

export const ResolvedThreadsRoot = createComponentAs<ResolvedThreadsRootProps>(
  (props) => {
    const htmlProps = useResolvedThreadsRoot(props);
    return createElementAs('div', htmlProps);
  }
);
