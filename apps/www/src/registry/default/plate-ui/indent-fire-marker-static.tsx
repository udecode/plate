import React from 'react';

import type { PlateRenderElementProps } from '@udecode/plate-common/react';
import type { TIndentElement } from '@udecode/plate-indent';

export function FireMarkerStatic({
  element,
}: Omit<PlateRenderElementProps, 'children'>) {
  return (
    <div contentEditable={false}>
      <span style={{ left: -26, position: 'absolute', top: -1 }}>
        {(element as TIndentElement).indent % 2 === 0 ? '🔥' : '🚀'}
      </span>
    </div>
  );
}

export function FireLiComponentStatic(props: PlateRenderElementProps) {
  const { children } = props;

  return <span>{children}</span>;
}
