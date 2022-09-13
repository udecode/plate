import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { determineAbsolutePosition, isClickInsideThreads } from '../../utils';

export type ResolvedThreadsRootProps = {
  onClose: () => void;
  parentRef: RefObject<HTMLElement>;
} & HTMLPropsAs<'div'>;

export type ResolveThreadsPosition = {
  top: number;
  left: number;
};

export const useResolvedThreadsRoot = (props: ResolvedThreadsRootProps) => {
  const { onClose, parentRef } = props;

  const [position, setPosition] = useState<ResolveThreadsPosition | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  const onClick = useCallback(
    (event: MouseEvent) => {
      if (!isClickInsideThreads(event)) {
        onClose();
      }
    },
    [onClose]
  );

  const updatePosition = useCallback(() => {
    const parentElement = parentRef.current!;
    const newPosition = determineAbsolutePosition(parentElement);
    newPosition.top += parentElement.clientHeight;
    newPosition.left =
      newPosition.left -
      0.5 * ref.current!.clientWidth +
      0.5 * parentElement.clientWidth;
    setPosition(newPosition);
  }, [parentRef]);

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
    ...props,
    ref,
    style: { ...position },
  };
};

export const ResolvedThreadsRoot = createComponentAs<ResolvedThreadsRootProps>(
  (props) => {
    const htmlProps = useResolvedThreadsRoot(props);
    return createElementAs('div', htmlProps);
  }
);
