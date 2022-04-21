import { Element } from 'slate';
import { AnyObject } from '../utility/AnyObject';
import { TText } from './TText';

export type TElement<TExtension = AnyObject> = Element &
  TExtension &
  AnyObject & {
    type: string;
    children: (TElement | TText)[];
  };

export const isElement: <TExtension = AnyObject>(
  value: any
) => value is TElement<TExtension> = Element.isElement as any;
