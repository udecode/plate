import { Editor } from 'slate';
import { UnknownObject } from '../utility/AnyObject';
import { TElement } from './TElement';
import { TText } from './TText';

// export type TEditor<TExtension = AnyObject> = Editor &
//   TExtension &
//   AnyObject & {
//     children: TDescendant[];
//   };

export type Value = TElement[];

export type TEditor<V extends Value> = Omit<
  Editor,
  'children' | 'marks' | 'getFragment' | 'insertFragment' | 'insertNode'
> &
  UnknownObject & {
    children: V;
    marks: Record<string, any> | null;
    getFragment: () => Array<TElement | TText>;
    insertFragment: (fragment: Array<TElement | TText>) => void;
    insertNode: (node: TElement | TText | Array<TElement | TText>) => void;
  };

/**
 * A helper type for getting the value of an editor.
 */
export type ValueOf<E extends TEditor<Value>> = E['children'];
