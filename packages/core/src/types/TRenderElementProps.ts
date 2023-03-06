import { EElement, TElement } from '@udecode/slate';
import { RenderElementProps } from 'slate-react';
import { Value } from '../../../slate/src/interfaces/editor/TEditor';

export type TRenderElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>
> = Omit<RenderElementProps, 'element'> & {
  element: N;
};

export type RenderElementFn<V extends Value = Value> = (
  props: TRenderElementProps<V>
) => JSX.Element;
