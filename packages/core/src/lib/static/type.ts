import type { TElement, TText } from '@udecode/slate';

export interface TRenderStaticElementProps<T extends TElement = TElement> {
  attributes: {
    'data-slate-node': 'element';
    ref: any;
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
  };
  children: any;
  element: T;
}

export type RenderStaticElement<T extends TElement = TElement> = (
  props: TRenderStaticElementProps<T>
) => React.ReactElement | undefined;

export interface StaticElementProps<T extends TElement = TElement> {
  attributes?: Record<string, any>;
  children?: React.ReactNode;
  element?: T;
}

export interface TRenderStaticLeafProps<N extends TText = TText> {
  attributes: {
    'data-slate-leaf': true;
  };
  children: any;
  leaf: N;
  text: N;
}

export type RenderStaticLeaf<N extends TText = TText> = (
  props: TRenderStaticLeafProps<N>
) => React.ReactElement | undefined;

export interface StaticLeafProps<N extends TText = TText> {
  as?: React.ElementType;
  attributes?: Record<string, any>;
  children?: React.ReactNode;
  leaf?: N;
}
