import type React from 'react';

import type { Element, Path } from '@platejs/plite';

export type RenderElementFn = (
  props: RenderElementProps
) => React.ReactElement | null;

export type RenderElementProps<N extends Element = Element> = {
  attributes: {
    [key: string]: unknown;
    'data-plite-node': 'element';
    ref?: React.Ref<HTMLElement>;
    className?: string;
    'data-plite-inline'?: true;
    'data-plite-void'?: true;
    dir?: 'rtl';
    style?: React.CSSProperties;
  };
  children: React.ReactNode;
  element: N;
  /** Pre-computed path for static rendering (avoids expensive findPath traversal). */
  path?: Path;
};
