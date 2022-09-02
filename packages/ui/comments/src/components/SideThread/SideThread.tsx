import React from 'react';
import { createPortal } from 'react-dom';
import { Thread } from '../Thread';
import { getSideThreadStyles } from './SideThread.styles';
import { SideThreadStyleProps } from './SideThread.types';
import { useSideThread } from './useSideThread';

export const SideThread = (props: SideThreadStyleProps) => {
  const { position, threadProps } = useSideThread(props);

  const styles = getSideThreadStyles(props);

  return createPortal(
    <div
      css={styles.root.css}
      className={styles.root.className}
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      <Thread
        {...threadProps}
        showResolveThreadButton
        showReOpenThreadButton={false}
        showMoreButton
      />
    </div>,
    document.body
  );
};
