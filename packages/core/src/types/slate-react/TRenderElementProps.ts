import { EElement, TElement, Value } from '@udecode/slate';
import { RenderElementProps } from 'slate-react';

export type TRenderElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>,
> = Omit<RenderElementProps, 'element'> & {
  element: N;
};

export type RenderElementFn = (
  props: TRenderElementProps
) => React.ReactElement;
