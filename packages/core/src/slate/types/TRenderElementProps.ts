import { RenderElementProps } from 'slate-react';
import { Value } from './TEditor';
import { EElement } from './TElement';

export type TRenderElementProps<V extends Value> = Omit<
  RenderElementProps,
  'element'
> & {
  element: EElement<V>;
};

export type RenderElementFn<V extends Value> = (
  props: TRenderElementProps<V>
) => JSX.Element;
