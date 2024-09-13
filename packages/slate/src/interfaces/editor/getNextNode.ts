import type { Modify } from '@udecode/utils';

import { type EditorNextOptions, Editor } from 'slate';

import type { TDescendant } from '../node';
import type { NodeOf, TNodeMatch } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

export type GetNextNodeOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<EditorNextOptions<TDescendant>>,
  {
    match?: TNodeMatch<NodeOf<E>>;
  }
>;

/** Get the matching node in the branch of the document after a location. */
export const getNextNode = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetNextNodeOptions<E>
): TNodeEntry<N> | undefined =>
  Editor.next(editor as any, options as any) as any;
