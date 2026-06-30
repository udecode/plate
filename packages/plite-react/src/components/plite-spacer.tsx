import React, { type CSSProperties, type ReactNode } from 'react';

import { recordPliteReactRender } from '../render-profiler';
import { getPliteSpacerShellAttributes } from '../shell-runtime';

export const PliteSpacer = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => {
  recordPliteReactRender({ kind: 'spacer' });

  return <span {...getPliteSpacerShellAttributes({ style })}>{children}</span>;
};
