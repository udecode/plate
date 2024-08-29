import type { Modify } from '@udecode/utils';
import type { EditorAboveOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { AncestorOf, TAncestor } from '../node/TAncestor';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

import { type ENodeMatchOptions, getQueryOptions } from '../../utils/match';

export type GetAboveNodeOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<EditorAboveOptions<TAncestor>>,
  ENodeMatchOptions<E>
>;

/** Get the ancestor above a location in the document. */
export const getAboveNode = <
  N extends AncestorOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetAboveNodeOptions<E>
): TNodeEntry<N> | undefined =>
  Editor.above(editor as any, getQueryOptions(editor, options)) as any;
