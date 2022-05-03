import { Editor } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { TEditor, Value } from '../types/TEditor';
import { ENode, TNode, TNodeMatch } from '../types/TNode';
import { TNodeEntry } from '../types/TNodeEntry';

export type GetLevelsOptions<V extends Value, N extends TNode> = Modify<
  NonNullable<Parameters<typeof Editor.levels>[1]>,
  {
    match?: TNodeMatch<N & ENode<V>>;
  }
>;

/**
 * Iterate through all of the levels at a location.
 */
export const getLevels = <V extends Value, N extends TNode>(
  editor: TEditor<V>,
  options?: GetLevelsOptions<V, N>
): Generator<TNodeEntry<N & ENode<V>>, void, undefined> =>
  Editor.levels(editor as any, options as any) as any;
