import React from 'react';

import type { PlateRenderElementStaticProps } from '@udecode/plate-common';
import type { TIndentElement } from '@udecode/plate-indent';

export function FireMarkerStatic({
  element,
}: Omit<PlateRenderElementStaticProps, 'children'>) {
  return (
    <div contentEditable={false}>
      <span style={{ left: -26, position: 'absolute', top: -1 }}>
        {(element as TIndentElement).indent % 2 === 0 ? '🔥' : '🚀'}
      </span>
    </div>
  );
}

export function FireLiComponentStatic({
  children,
}: PlateRenderElementStaticProps) {
  return <span>{children}</span>;
}
