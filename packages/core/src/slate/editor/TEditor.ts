import { Editor } from 'slate';
import { UnknownObject } from '../../common/types/utility/AnyObject';
import { Modify } from '../../common/types/utility/types';
import { EElement, EElementOrText, TElement } from '../element/TElement';
import { ENodeEntry } from '../node/TNodeEntry';
import { TOperation } from '../types/TOperation';

export type Value = TElement[];

export type TEditor<V extends Value> = Modify<
  Editor,
  {
    children: V;
    operations: TOperation[];
    marks: Record<string, any> | null;

    // Schema-specific node behaviors.
    isInline: <EV extends Value>(element: EElement<EV>) => boolean;
    isVoid: <EV extends Value>(element: EElement<EV>) => boolean;
    normalizeNode: <EV extends Value>(entry: ENodeEntry<EV>) => void;

    // Overrideable core actions.
    apply: (operation: TOperation) => void;
    getFragment: <EV extends Value>() => EElementOrText<EV>[];
    insertFragment: <EV extends Value>(fragment: EElementOrText<EV>[]) => void;
    insertNode: <EV extends Value>(
      node: EElementOrText<EV> | EElementOrText<EV>[]
    ) => void;
  }
> &
  UnknownObject;

/**
 * A helper type for getting the value of an editor.
 */
export type ValueOf<E extends TEditor<Value>> = E['children'];
