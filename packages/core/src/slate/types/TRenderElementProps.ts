import { RenderElementProps } from 'slate-react';
import { Value } from '../editor/TEditor';
import { EElement, TElement } from '../element/TElement';

export type TRenderElementProps<
  V extends Value,
  N extends TElement = EElement<V>
> = Omit<RenderElementProps, 'element'> & {
  element: N;
};

export type RenderElementFn<V extends Value> = (
  props: TRenderElementProps<V>
) => JSX.Element;
