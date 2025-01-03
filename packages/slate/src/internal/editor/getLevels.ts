import { levels } from 'slate';

import type { TEditor, ValueOf } from '../../interfaces/editor/TEditor';
import type { GetLevelsOptions } from '../../interfaces/editor/editor-types';
import type { NodeOf } from '../../interfaces/node/TNode';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getQueryOptions } from '../../utils';

export const getLevels = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetLevelsOptions<ValueOf<E>>
): Generator<TNodeEntry<N>, void, undefined> => {
  return levels(editor as any, getQueryOptions(editor, options)) as any;
};
