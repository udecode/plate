import type React from 'react';

import type { TElement } from '@platejs/slate';

export type RenderElementFn = (
  props: RenderElementProps
) => React.ReactElement<any>;

export type RenderElementProps<N extends TElement = TElement> = {
  attributes: {
    'data-slate-node': 'element';
    ref: any;
    className?: string;
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
    style?: React.CSSProperties;
  };
  children: any;
  element: N;
};
