import React, { RefObject, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { findThreadNodeEntries } from '@udecode/plate-comments';
import { usePlateEditorRef } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { determineAbsolutePosition } from '../determineAbsolutePosition';
import { Thread } from '../Thread';
import { createThreadsStyles } from './Threads.styles';

export function Threads(
  props: { parent: RefObject<HTMLElement> } & StyledProps
) {
  const editor = usePlateEditorRef();
  const { parent } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useEffect(
    function () {
      const parentElement = parent.current!;
      const newPosition = determineAbsolutePosition(parentElement);
      newPosition.top += parentElement.clientHeight;
      newPosition.left =
        newPosition.left -
        0.5 * ref.current!.clientWidth +
        0.5 * parentElement.clientWidth;
      setPosition(newPosition);
    },
    [parent]
  );

  const { root } = createThreadsStyles(props);

  const threadNodeEntries = Array.from(findThreadNodeEntries(editor));
  const threads = threadNodeEntries.map(
    (threadNodeEntry) => threadNodeEntry[0].thread
  );
  const resolvedThreads = threads.filter((thread) => thread.isResolved);

  return ReactDOM.createPortal(
    <div
      ref={ref}
      css={root.css}
      className={root.className}
      style={{ ...position }}
    >
      {resolvedThreads.map((thread) => {
        return (
          <Thread
            key={thread.id}
            thread={thread}
            onSubmitComment={() => {}}
            onCancelCreateThread={() => {}}
            showResolveThreadButton={false}
            showReOpenThreadButton
            showMoreButton={false}
          />
        );
      })}
    </div>,
    document.body
  );
}
