import React from 'react';
import ReactDOM from 'react-dom';
import { StyledProps } from '@udecode/plate-styled-components';
import { ThreadPosition } from '../../types';
import { CommonThreadAndSideThreadProps, Thread } from '../Thread';
import { createSideThreadStyles } from './SideThread.styles';

type SideThreadProps = {
  position: ThreadPosition;
} & StyledProps &
  CommonThreadAndSideThreadProps;

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
