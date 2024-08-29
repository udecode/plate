import type { Modify } from '@udecode/utils';

import { Editor, type EditorPreviousOptions } from 'slate';

import type { NodeOf, TNode, TNodeMatch } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

export type GetPreviousNodeOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<EditorPreviousOptions<TNode>>,
  {
    match?: TNodeMatch<NodeOf<E>>;
  }
>;

/** Get the matching node in the branch of the document before a location. */
export const getPreviousNode = <
  N extends NodeOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetPreviousNodeOptions<E>
): TNodeEntry<N> | undefined =>
  Editor.previous(editor as any, options as any) as any;
