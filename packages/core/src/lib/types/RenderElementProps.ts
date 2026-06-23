import type React from 'react';

import type { Element, Path } from '@platejs/plite';

export type RenderElementFn = (
  props: RenderElementProps
) => React.ReactElement<any>;

export type RenderElementProps<N extends Element = Element> = {
  attributes: {
    'data-plite-node': 'element';
    ref: any;
    className?: string;
    'data-plite-inline'?: true;
    'data-plite-void'?: true;
    dir?: 'rtl';
    style?: React.CSSProperties;
  };
  children: any;
  element: N;
  /** Pre-computed path for static rendering (avoids expensive findPath traversal). */
  path?: Path;
};
