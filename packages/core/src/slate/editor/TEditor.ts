import { Editor } from 'slate';
import { UnknownObject } from '../../common/types/utility/AnyObject';
import { Modify } from '../../common/types/utility/types';
import { EDescendant } from '../node/TDescendant';
import { EElement, TElement } from '../element/TElement';
import { TNodeEntry } from '../node/TNodeEntry';
import { TOperation } from '../types/TOperation';

export type Value = TElement[];

export type NNodeEntry<V extends Value> = TNodeEntry<
  TEditor<V> | EDescendant<V>
>;

export type TEditor<V extends Value> = Modify<
  Editor,
  {
    children: V;
    operations: TOperation[];
    marks: Record<string, any> | null;

    // Schema-specific node behaviors.
    isInline: <EV extends V>(element: EElement<EV>) => boolean;
    isVoid: <EV extends V>(element: EElement<EV>) => boolean;
    normalizeNode: <EV extends V>(entry: NNodeEntry<EV>) => void;

    // Overrideable core actions.
    apply: (operation: TOperation) => void;
    getFragment: <EV extends V>() => EDescendant<EV>[];
    insertFragment: <EV extends V>(fragment: EDescendant<EV>[]) => void;
    insertNode: <EV extends V>(
      node: EDescendant<EV> | EDescendant<EV>[]
    ) => void;
  }
> &
  UnknownObject;

/**
 * A helper type for getting the value of an editor.
 */
export type ValueOf<E extends TEditor<Value>> = E['children'];
