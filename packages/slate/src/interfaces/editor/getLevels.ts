import type { Modify } from '@udecode/utils';

import { type EditorLevelsOptions, Editor } from 'slate';

import type { NodeOf, TNode, TNodeMatch } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

export type GetLevelsOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<EditorLevelsOptions<TNode>>,
  {
    match?: TNodeMatch<NodeOf<E>>;
  }
>;

/** Iterate through all of the levels at a location. */
export const getLevels = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetLevelsOptions<E>
): Generator<TNodeEntry<N>, void, undefined> =>
  Editor.levels(editor as any, options as any) as any;
