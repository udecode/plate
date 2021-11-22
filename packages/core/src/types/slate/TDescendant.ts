import { AnyObject } from '../utility/AnyObject';
import { isElement, TElement } from './TElement';
import { isText, TText } from './TText';

// @ts-ignore
export type TDescendant<TExtension = AnyObject> =
  | TElement<TExtension>
  | TText<TExtension>;

export const isDescendant: (value: any) => value is TDescendant = ((
  node: any
) => isElement(node) || isText(node)) as any;
