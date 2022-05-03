import { Editor } from 'slate';
import { getQueryOptions } from '../../common/queries/match';
import { ENodeMatchOptions } from '../../common/types/Editor.types';
import { Modify } from '../../common/types/utility/types';
import { TEditor, Value } from '../types/TEditor';
import { EAncestorEntry } from '../types/TNodeEntry';

export type GetAboveNodeOptions<V extends Value> = Modify<
  NonNullable<Parameters<typeof Editor.above>[1]>,
  ENodeMatchOptions<V>
>;

/**
 * Get the ancestor above a location in the document.
 */
export const getAboveNode = <V extends Value>(
  editor: TEditor<V>,
  options: GetAboveNodeOptions<V> = {}
): EAncestorEntry<V> | undefined =>
  Editor.above(editor as any, getQueryOptions(editor, options)) as any;
