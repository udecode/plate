import { TEditor } from './TEditor';
import { TElement } from './TElement';
import { TText } from './TText';

export type TNode<TExtension = {}> =
  | TEditor<TExtension>
  | TElement<TExtension>
  | TText<TExtension>;
