import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import {
  NodeOf,
  TNode,
  TNodeEntry,
  TNodeMatch,
} from '../../../types/slate/TNode';

export type GetLevelsOptions<V extends Value, N extends TNode> = Parameters<
  typeof Editor.above
>[1] & {
  match?: TNodeMatch<N & NodeOf<TEditor<V>>>;
};

/**
 * Iterate through all of the levels at a location.
 */
export const getLevels = <V extends Value, N extends TNode>(
  editor: TEditor<V>,
  options?: GetLevelsOptions<V, N>
): Generator<TNodeEntry<N & NodeOf<TEditor<V>>>, void, undefined> =>
  Editor.levels(editor as any, options) as any;
