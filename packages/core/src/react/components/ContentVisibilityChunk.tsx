import React from 'react';

import type { PlateChunkProps } from './plate-nodes';

export const ContentVisibilityChunk = ({
  attributes,
  children,
  lowest,
}: PlateChunkProps) => {
  if (!lowest) return children;

  return (
    <div {...attributes} style={{ contentVisibility: 'auto' }}>
      {children}
    </div>
  );
};
