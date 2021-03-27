import { Editor } from 'slate';
import { TEditor } from './TEditor';
import { isElement, TElement } from './TElement';

export type TAncestor<TExtension = {}> =
  | TEditor<TExtension>
  | TElement<TExtension>;

export const isAncestor: (value: any) => value is TAncestor = ((node: any) =>
  Editor.isEditor(node) || isElement(node)) as any;
