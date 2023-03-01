import { RenderElementProps } from 'slate-react';
import { Value } from '../../../slate-utils/src/slate/editor/TEditor';
import {
  EElement,
  TElement,
} from '../../../slate-utils/src/slate/element/TElement';

export type TRenderElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>
> = Omit<RenderElementProps, 'element'> & {
  element: N;
};

export type RenderElementFn<V extends Value = Value> = (
  props: TRenderElementProps<V>
) => JSX.Element;
