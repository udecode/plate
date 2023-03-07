import { Modify } from '@udecode/utils';
import { Editor, EditorLevelsOptions } from 'slate';
import { ENode, TNode, TNodeMatch } from '../node/TNode';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

export type GetLevelsOptions<V extends Value = Value> = Modify<
  NonNullable<EditorLevelsOptions<TNode>>,
  {
    match?: TNodeMatch<ENode<V>>;
  }
>;

/**
 * Iterate through all of the levels at a location.
 */
export const getLevels = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: GetLevelsOptions<V>
): Generator<TNodeEntry<N>, void, undefined> =>
  Editor.levels(editor as any, options as any) as any;
