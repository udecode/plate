import React from 'react';

import type { SlateRenderElementProps } from '@udecode/plate-core';
import type { TIndentElement } from '@udecode/plate-indent';

export const FireMarker = (
  props: Omit<SlateRenderElementProps, 'children'>
) => {
  const { element } = props;

  return (
    <div contentEditable={false}>
      <span style={{ left: -26, position: 'absolute', top: -1 }}>
        {(element as TIndentElement).indent % 2 === 0 ? '🔥' : '🚀'}
      </span>
    </div>
  );
};

export const FireLiComponent = (props: SlateRenderElementProps) => {
  const { children } = props;

  return <span>{children}</span>;
};
