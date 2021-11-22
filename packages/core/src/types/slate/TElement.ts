import { Element } from 'slate';
import { AnyObject } from '../utility/AnyObject';
import { TDescendant } from './TDescendant';

export type TElement<TExtension = AnyObject> = Element &
  TExtension &
  AnyObject & {
    type: string;
    children: TDescendant[];
  };

export const isElement: <TExtension = AnyObject>(
  value: any
) => value is TElement<TExtension> = Element.isElement as any;
