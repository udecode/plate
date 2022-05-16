import { Editor } from 'slate';
import { ENodeMatchOptions, getQueryOptions } from '../../common/queries/match';
import { Modify } from '../../common/types/utility/types';
import { EAncestor } from '../node/TAncestor';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

export type GetAboveNodeOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Editor.above>[1]>,
  ENodeMatchOptions<V>
>;

/**
 * Get the ancestor above a location in the document.
 */
export const getAboveNode = <N extends EAncestor<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: GetAboveNodeOptions<V>
): TNodeEntry<N> | undefined =>
  Editor.above(editor as any, getQueryOptions(editor, options)) as any;
