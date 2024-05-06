import type { Modify, UnknownObject } from '@udecode/utils';
import type { Editor, Path } from 'slate';

import type { TOperation } from '../../types/TOperation';
import type { EElement, EElementOrText, TElement } from '../element/TElement';
import type { TDescendant } from '../node/TDescendant';
import type { ENode, TNode } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';

export type Value = TElement[];

/** A helper type for getting the value of an editor. */
export type ValueOf<E extends TEditor> = E['children'];

export type TEditor<V extends Value = Value> = Modify<
  Editor,
  {
    // Overrideable core actions.
    apply: <N extends TDescendant>(operation: TOperation<N>) => void;
    children: V;
    getDirtyPaths: <N extends TDescendant>(operation: TOperation<N>) => Path[];
    getFragment: <N extends TDescendant>() => N[];

    id: any;
    insertFragment: <N extends TDescendant>(fragment: N[]) => void;
    insertNode: <N extends TDescendant>(node: N) => void;
    // Schema-specific node behaviors.
    isInline: <N extends TElement>(element: N) => boolean;

    isVoid: <N extends TElement>(element: N) => boolean;
    markableVoid: <N extends TElement>(element: N) => boolean;
    marks: Record<string, any> | null;
    normalizeNode: <N extends TNode>(entry: TNodeEntry<N>) => void;
    operations: TOperation[];
  }
> &
  UnknownObject;

/**
 * Get editor with typed methods and operations. Note that it can't be used as a
 * parameter of type TEditor.
 */
export const getTEditor = <V extends Value, E extends TEditor<V> = TEditor<V>>(
  editor: E
) =>
  editor as Modify<
    E,
    {
      // Overrideable core actions.
      apply: (operation: TOperation<EElementOrText<V>>) => void;

      getFragment: () => EElementOrText<V>[];
      insertFragment: (fragment: EElementOrText<V>[]) => void;
      insertNode: (node: EElementOrText<V> | EElementOrText<V>[]) => void;

      // Schema-specific node behaviors.
      isInline: (element: EElement<V>) => boolean;
      isVoid: (element: EElement<V>) => boolean;
      normalizeNode: (entry: TNodeEntry<ENode<V>>) => void;
      operations: TOperation<EElementOrText<V>>[];
    }
  >;
