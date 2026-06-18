import type { CSSProperties, ReactNode } from 'react';

import { recordSlateReactRender } from '../render-profiler';
import { getSlateSpacerShellAttributes } from '../shell-runtime';

export const SlateSpacer = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => {
  recordSlateReactRender({ kind: 'spacer' });

  return <span {...getSlateSpacerShellAttributes({ style })}>{children}</span>;
};
