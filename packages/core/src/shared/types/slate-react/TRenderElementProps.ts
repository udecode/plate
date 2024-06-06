import type { EElement, TElement, Value } from '@udecode/slate';
import type { RenderElementProps } from 'slate-react';

export type TRenderElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>,
> = {
  element: N;
} & Omit<RenderElementProps, 'element'>;

export type RenderElementFn = (
  props: TRenderElementProps
) => React.ReactElement;
