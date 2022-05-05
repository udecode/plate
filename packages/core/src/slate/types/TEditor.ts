import { Editor } from 'slate';
import { UnknownObject } from '../../common/types/utility/AnyObject';
import { Modify } from '../../common/types/utility/types';
import { createTEditor } from '../../utils/createTEditor';
import { MyValue } from '../../utils/setPlatePlugins';
import { TElement, VElement } from './TElement';
import { TNode } from './TNode';
import { TNodeEntry } from './TNodeEntry';
import { TOperation } from './TOperation';
import { VText } from './TText';

export type Value = TElement[];

export type TEditor<V extends Value> = Modify<
  Editor,
  {
    children: V;
    operations: TOperation[];
    marks: Record<string, any> | null;

    // Schema-specific node behaviors.
    isInline: <EV extends V>(element: VElement<EV>) => boolean;
    isVoid: <EV extends V>(element: VElement<EV>) => boolean;
    normalizeNode: <EV extends V>(
      entry: TNodeEntry<TEditor<EV> | VElement<EV> | VText<EV>>
    ) => void;

    // Overrideable core actions.
    apply: (operation: TOperation) => void;
    getFragment: <EV extends V>() => Array<VElement<EV> | VText<EV>>;
    insertFragment: <EV extends V>(
      fragment: Array<VElement<EV> | VText<EV>>
    ) => void;
    insertNode: <EV extends V>(
      node: VElement<EV> | VText<EV> | Array<VElement<EV> | VText<EV>>
    ) => void;
  }
> &
  UnknownObject;

const a: TNode = createTEditor<MyValue>();

/**
 * A helper type for getting the value of an editor.
 */
export type ValueOf<E extends TEditor<Value>> = E['children'];
