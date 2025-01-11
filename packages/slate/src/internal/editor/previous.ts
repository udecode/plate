import { previous as previousBase } from 'slate';

import type { Editor, ValueOf } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';

import {
  type DescendantOf,
  type EditorPreviousOptions,
  PathApi,
} from '../../interfaces';
import { getQueryOptions } from '../../utils';

export const previous = <N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  options?: EditorPreviousOptions<ValueOf<E>>
): NodeEntry<N> | undefined => {
  const getPrevious = (o: EditorPreviousOptions<ValueOf<E>>) => {
    try {
      return previousBase(editor as any, getQueryOptions(editor, o)) as any;
    } catch {}
  };

  if (options?.sibling) {
    const path = getQueryOptions(editor, options).at;

    if (!path) return;

    const previousPath = PathApi.previous(path);

    if (!previousPath) return;

    const previousNode = editor.api.node(previousPath);

    return previousNode as NodeEntry<N>;
  }
  if (!(options?.id && options?.block)) {
    return getPrevious(options as any);
  }

  const block = editor.api.node({
    id: options.id,
    at: [],
  });

  if (!block) return;

  // both id and block are defined
  const prevEntry = getPrevious({ at: block[1], block: true });

  return prevEntry ? (prevEntry as any) : ([null, [-1]] as any);
};
