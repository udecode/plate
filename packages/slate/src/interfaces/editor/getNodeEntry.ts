import { Editor, type EditorNodeOptions, type Location } from 'slate';

import type { ENode } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value } from './TEditor';

/** Get the node at a location. */
export const getNodeEntry = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorNodeOptions
): TNodeEntry<N> | undefined => {
  try {
    return Editor.node(editor as any, at, options) as any;
  } catch (error) {}
};

// export const getNodeEntry =
//   // <N extends ENode<V>, V extends Value = Value>
//   <N extends ENode<E['children']>, E extends TEditor = TEditor>(
//     editor: E,
//     at: Location,
//     options?: EditorNodeOptions
//   ): TNodeEntry<N> | undefined => {
//     try {
//       return Editor.node(editor as any, at, options) as any;
//     } catch (error) {}
//   };

// type GetPreviousNodeOptions<E extends TEditor> = Modify<
//   NonNullable<EditorPreviousOptions<TNode>>,
//   {
//     match?: TNodeMatch<ENode<E['children']>>;
//   }
// >;
//
// /** Get the matching node in the branch of the document before a location. */
// const getPreviousNode = <
//   N extends ENode<E['children']>,
//   E extends TEditor = TEditor,
// >(
//   editor: E,
//   options?: GetPreviousNodeOptions<E>
// ): TNodeEntry<N> | undefined =>
//   Editor.previous(editor as any, options as any) as any;
//
// type A = { children: [{ text: '' }]; type: 'a' };
// type B = { children: [{ text: '' }]; type: 'b' };
//
// const editor = {} as { test: 1 } & PlateEditor<A[]>;
// const a = getNodeEntry<A>(editor, {} as any);
// const type = a?.[0].type;
//
// const b = getPreviousNode(editor, {
//   match: (node) => {
//     if (isElement(node)) {
//       const type = node.type;
//     }
//
//     return true;
//   },
// });
//
// if (isElement(b?.[0])) {
//   const type = b[0].type;
// }
