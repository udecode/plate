import { Editor } from 'slate';
import { UnknownObject } from '../../common/types/utility/AnyObject';
import { Modify } from '../../common/types/utility/types';
import { TElement } from './TElement';
import { TNodeEntry } from './TNodeEntry';
import { TOperation } from './TOperation';
import { TText } from './TText';

export type Value = TElement[];

export type TEditor<V extends Value> = Modify<
  Editor,
  {
    children: V;
    operations: TOperation[];
    marks: Record<string, any> | null;

    // Schema-specific node behaviors.
    isInline: (element: TElement) => boolean;
    isVoid: (element: TElement) => boolean;
    normalizeNode: (entry: TNodeEntry) => void;

    // Overrideable core actions.
    apply: (operation: TOperation) => void;
    getFragment: () => Array<TElement | TText>;
    insertFragment: (fragment: Array<TElement | TText>) => void;
    insertNode: (node: TElement | TText | Array<TElement | TText>) => void;
  }
> &
  UnknownObject;

/**
 * A helper type for getting the value of an editor.
 */
export type ValueOf<E extends TEditor<Value>> = E['children'];
