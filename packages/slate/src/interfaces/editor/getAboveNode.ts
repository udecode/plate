import { Modify } from '@udecode/utils';
import { Editor } from 'slate';
import { EditorAboveOptions } from 'slate/dist/interfaces/editor';
import { ENodeMatchOptions, getQueryOptions } from '../../utils/match';
import { EAncestor, TAncestor } from '../node/TAncestor';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

export type GetAboveNodeOptions<V extends Value = Value> = Modify<
  NonNullable<EditorAboveOptions<TAncestor>>,
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
