import React from 'react';
import { createPortal } from 'react-dom';
import { StyledProps } from '@udecode/plate-styled-components';
import { ThreadPosition } from '../../types';
import { CommonThreadAndSideThreadProps, Thread } from '../Thread';
import { createSideThreadStyles } from './SideThread.styles';

type SideThreadProps = {
  position: ThreadPosition;
} & StyledProps &
  CommonThreadAndSideThreadProps;

export const SideThread = (props: SideThreadProps) => {
  const { position, ...otherProps } = props;

  const { root } = createSideThreadStyles(otherProps);

  return createPortal(
    <div
      css={root.css}
      className={root.className}
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      <Thread
        {...otherProps}
        showResolveThreadButton
        showReOpenThreadButton={false}
        showMoreButton
      />
    </div>,
    document.body
  );
};
