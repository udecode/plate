import { levels } from 'slate';

import type { Editor, ValueOf } from '../../interfaces/editor/editor-type';
import type { EditorLevelsOptions } from '../../interfaces/index';
import type { NodeOf } from '../../interfaces/node';
import type { NodeEntry } from '../../interfaces/node-entry';

import { getQueryOptions } from '../../utils';

export const getLevels = <N extends NodeOf<E>, E extends Editor = Editor>(
  editor: E,
  options?: EditorLevelsOptions<ValueOf<E>>
): Generator<NodeEntry<N>, void, undefined> => {
  return levels(editor as any, getQueryOptions(editor, options)) as any;
};
