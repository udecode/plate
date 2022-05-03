import React from 'react';
import ReactDOM from 'react-dom';
import { Comment, Thread as ThreadModel } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { FetchContacts } from '../FetchContacts';
import { Thread } from '../Thread';
import { createSideThreadStyles } from './SideThread.styles';

interface SideThreadProps extends StyledProps {
  thread: ThreadModel;
  onSaveComment: (comment: Comment) => void;
  onSubmitComment: (comment: Comment) => void;
  onCancelCreateThread: () => void;
  fetchContacts: FetchContacts;
  position: { left: number; top: number };
}

export function SideThread({ position, ...props }: SideThreadProps) {
  const { root } = createSideThreadStyles(props);

  return ReactDOM.createPortal(
    <div
      css={root.css}
      className={root.className}
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      <Thread
        {...props}
        showResolveThreadButton
        showReOpenThreadButton={false}
        showMoreButton
      />
    </div>,
    document.body
  );
}
