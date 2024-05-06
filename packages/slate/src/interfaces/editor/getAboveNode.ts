import type { Modify } from '@udecode/utils';
import type { EditorAboveOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { EAncestor, TAncestor } from '../node/TAncestor';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value } from './TEditor';

import { type ENodeMatchOptions, getQueryOptions } from '../../utils/match';

export type GetAboveNodeOptions<V extends Value = Value> = Modify<
  NonNullable<EditorAboveOptions<TAncestor>>,
  ENodeMatchOptions<V>
>;

/** Get the ancestor above a location in the document. */
export const getAboveNode = <N extends EAncestor<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: GetAboveNodeOptions<V>
): TNodeEntry<N> | undefined =>
  Editor.above(editor as any, getQueryOptions(editor, options)) as any;
