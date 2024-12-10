import type { AnyObject } from '@udecode/plate-common';
import type { TElement, TText } from '@udecode/slate';

// export interface TRenderStaticElementProps<T extends TElement = TElement> {
//   attributes: {
//     'data-slate-node': 'element';
//     ref: any;
//     'data-slate-inline'?: true;
//     'data-slate-void'?: true;
//     dir?: 'rtl';
//   };
//   children: any;
//   element: T;
//   className?: string;
//   style?: CSSStyleDeclaration;
// }

export interface StaticElementProps<T extends TElement = TElement> {
  attributes: {
    'data-slate-node': 'element';
    ref: any;
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
  };
  children: any;
  element: T;
  as?: React.ElementType;
  className?: string;
  nodeProps?: AnyObject;
  style?: React.CSSProperties;
}

export type RenderStaticElement<T extends TElement = TElement> = (
  props: StaticElementProps<T>
) => React.ReactElement | undefined;

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
