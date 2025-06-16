import * as React from 'react';

import type { PlateChunkProps } from 'platejs/react';

export function Chunk({ attributes, children, lowest }: PlateChunkProps) {
  return (
    <div {...attributes} className={lowest ? '[content-visibility:auto]' : ''}>
      {children}
    </div>
  );
}
