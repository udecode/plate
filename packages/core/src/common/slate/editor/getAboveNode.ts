import { Editor } from 'slate';
import { AncestorOf } from '../../../types/slate/TAncestor';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { TNodeEntry } from '../../../types/slate/TNode';
import { getQueryOptions } from '../../queries/match';
import { ENodeMatchOptions } from '../../types/Editor.types';

export type GetAboveNodeOptions<V extends Value> = Parameters<
  typeof Editor.above
>[1] &
  ENodeMatchOptions<V>;

/**
 * Get the ancestor above a location in the document.
 */
export const getAboveNode = <V extends Value>(
  editor: TEditor<V>,
  options: GetAboveNodeOptions<V> = {}
): TNodeEntry<AncestorOf<TEditor<V>>> | undefined =>
  Editor.above(editor as any, getQueryOptions(editor, options)) as any;
