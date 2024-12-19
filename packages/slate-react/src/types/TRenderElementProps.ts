import type { TElement } from '@udecode/slate';

export interface TRenderElementProps<N extends TElement = TElement> {
  attributes: {
    'data-slate-node': 'element';
    ref: any;
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
  };
  children: any;
  element: N;
}

export type RenderElementFn = (
  props: TRenderElementProps
) => React.ReactElement;
