import { Editor, Path } from 'slate';
import { UnknownObject } from '../../types/misc/AnyObject';
import { Modify } from '../../types/misc/types';
import { EElement, EElementOrText, TElement } from '../element/TElement';
import { TDescendant } from '../node/TDescendant';
import { ENode, TNode } from '../node/TNode';
import { TNodeEntry } from '../node/TNodeEntry';
import { TOperation } from '../types/TOperation';

export type Value = TElement[];

/**
 * A helper type for getting the value of an editor.
 */
export type ValueOf<E extends TEditor> = E['children'];

export type TEditor<V extends Value = Value> = Modify<
  Editor,
  {
    id: any;
    children: V;
    operations: TOperation[];
    marks: Record<string, any> | null;

    // Schema-specific node behaviors.
    isInline: <N extends TElement>(element: N) => boolean;
    isVoid: <N extends TElement>(element: N) => boolean;
    markableVoid: <N extends TElement>(element: N) => boolean;
    normalizeNode: <N extends TNode>(entry: TNodeEntry<N>) => void;

    // Overrideable core actions.
    apply: <N extends TDescendant>(operation: TOperation<N>) => void;
    getFragment: <N extends TDescendant>() => N[];
    insertFragment: <N extends TDescendant>(fragment: N[]) => void;
    insertNode: <N extends TDescendant>(node: N) => void;
    getDirtyPaths: <N extends TDescendant>(operation: TOperation<N>) => Path[];
  }
> &
  UnknownObject;

/**
 * Get editor with typed methods and operations.
 * Note that it can't be used as a parameter of type TEditor.
 */
export const getTEditor = <V extends Value, E extends TEditor<V> = TEditor<V>>(
  editor: E
) =>
  editor as Modify<
    E,
    {
      operations: TOperation<EElementOrText<V>>[];

      // Schema-specific node behaviors.
      isInline: (element: EElement<V>) => boolean;
      isVoid: (element: EElement<V>) => boolean;
      normalizeNode: (entry: TNodeEntry<ENode<V>>) => void;

      // Overrideable core actions.
      apply: (operation: TOperation<EElementOrText<V>>) => void;
      getFragment: () => EElementOrText<V>[];
      insertFragment: (fragment: EElementOrText<V>[]) => void;
      insertNode: (node: EElementOrText<V> | EElementOrText<V>[]) => void;
    }
  >;
