import { RenderElementProps } from 'slate-react';
import { AnyObject } from '../utility/AnyObject';
import { TElement } from './TElement';

export type TRenderElementProps<TExtension = AnyObject> = Omit<
  RenderElementProps,
  'element'
> & {
  element: TElement<TExtension>;
};
