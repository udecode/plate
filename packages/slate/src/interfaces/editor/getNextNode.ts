import type { Modify } from '@udecode/utils';

import { Editor, type EditorNextOptions } from 'slate';

import type { TDescendant } from '../node';
import type { ENode, TNodeMatch } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value } from './TEditor';

export type GetNextNodeOptions<V extends Value = Value> = Modify<
  NonNullable<EditorNextOptions<TDescendant>>,
  {
    match?: TNodeMatch<ENode<V>>;
  }
>;

/** Get the matching node in the branch of the document after a location. */
export const getNextNode = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: GetNextNodeOptions<V>
): TNodeEntry<N> | undefined =>
  Editor.next(editor as any, options as any) as any;
