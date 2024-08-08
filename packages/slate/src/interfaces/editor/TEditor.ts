import type { Modify, UnknownObject } from '@udecode/utils';
import type { Editor, Path } from 'slate';

import type { TOperation } from '../../types/TOperation';
import type { TElement } from '../element/TElement';
import type { TDescendant } from '../node/TDescendant';
import type { TNode } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';

export type Value = TElement[];

/** A helper type for getting the value of an editor. */
export type ValueOf<E extends TEditor> = E['children'];

export type InferEditorValue<E> = E extends TEditor<infer V> ? V : never;

// type EditorWithV<V extends Value> = {
//   apply: (operation: TOperation<EElementOrText<V>>) => void;
//   getFragment: () => EElementOrText<V>[];
//   insertFragment: (fragment: EElementOrText<V>[]) => void;
//   insertNode: (node: EElementOrText<V> | EElementOrText<V>[]) => void;
//   isInline: (element: EElement<V>) => boolean;
//   isVoid: (element: EElement<V>) => boolean;
//   normalizeNode: (
//     entry: ENodeEntry<V>,
//     options?: { operation?: TOperation }
//   ) => void;
//   operations: TOperation<EElementOrText<V>>[];
// };

export type TEditor<V extends Value = Value> = Modify<
  Editor,
  {
    apply: <N extends TDescendant>(operation: TOperation<N>) => void;
    children: V;
    getDirtyPaths: <N extends TDescendant>(operation: TOperation<N>) => Path[];
    getFragment: () => TDescendant[];
    id: any;
    insertFragment: <N extends TDescendant>(fragment: N[]) => void;
    insertNode: <N extends TDescendant>(node: N) => void;
    isInline: <N extends TElement>(element: N) => boolean;
    isVoid: <N extends TElement>(element: N) => boolean;
    markableVoid: <N extends TElement>(element: N) => boolean;
    marks: Record<string, any> | null;
    normalizeNode: <N extends TNode>(
      entry: TNodeEntry<N>,
      options?: { operation?: TOperation }
    ) => void;
    operations: TOperation[];
  }
  // & EditorWithV<V>
> &
  UnknownObject;

/**
 * Get editor with typed methods and operations. Note that it can't be used as a
 * parameter of type TEditor.
 */
// export const getTEditor = <V extends Value, E extends TEditor<V> = TEditor<V>>(
//   editor: E
// ) =>
//   editor as Modify<
//     E,
//     {
//       // Overrideable core actions.
//       apply: (operation: TOperation<EElementOrText<V>>) => void;
//       getFragment: () => EElementOrText<V>[];
//       insertFragment: (fragment: EElementOrText<V>[]) => void;
//       insertNode: (node: EElementOrText<V> | EElementOrText<V>[]) => void;
//
//       // Schema-specific node behaviors.
//       isInline: (element: EElement<V>) => boolean;
//       isVoid: (element: EElement<V>) => boolean;
//       normalizeNode: (
//         entry: TNodeEntry<ENode<V>>,
//         options?: { operation?: TOperation }
//       ) => void;
//       operations: TOperation<EElementOrText<V>>[];
//     }
//   >;
