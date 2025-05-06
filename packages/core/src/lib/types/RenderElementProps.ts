import type { TElement } from '@udecode/slate';

export type RenderElementFn = (
  props: RenderElementProps
) => React.ReactElement<any>;

export interface RenderElementProps<
  N extends TElement = TElement,
  T extends keyof HTMLElementTagNameMap = 'div',
> {
  attributes: {
    'data-slate-node': 'element';
    ref: any;
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
  } & React.HTMLAttributes<HTMLElement>;
  children: any;
  element: N;
}
