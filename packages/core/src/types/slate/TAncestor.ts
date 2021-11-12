import { Editor } from 'slate';
import { AnyObject } from '../utility/AnyObject';
import { TEditor } from './TEditor';
import { isElement, TElement } from './TElement';

export type TAncestor<TExtension = AnyObject> =
  | TEditor<TExtension>
  | TElement<TExtension>;

export const isAncestor: (value: any) => value is TAncestor = ((node: any) =>
  Editor.isEditor(node) || isElement(node)) as any;
