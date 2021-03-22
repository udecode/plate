import { RenderElementProps } from 'slate-react';
import { TElement } from './TElement';

export type TRenderElementProps<TExtension = {}> = Omit<
  RenderElementProps,
  'element'
> & {
  element: TElement<TExtension>;
};
