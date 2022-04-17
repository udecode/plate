import React from 'react';
import { Thread, ThreadProps } from '../Thread';
import { createSideThreadStyles } from './SideThread.styles';

interface SideThreadProps extends ThreadProps {
  position: { left: number; top: number };
}

export function SideThread({ position, ...props }: SideThreadProps) {
  const { root } = createSideThreadStyles(props);

  return (
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
    </div>
  );
}
