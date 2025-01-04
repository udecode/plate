import { Path, previous } from 'slate';

import type { DescendantOf } from '../../interfaces';
import type { TEditor, ValueOf } from '../../interfaces/editor/TEditor';
import type { GetPreviousNodeOptions } from '../../interfaces/editor/editor-types';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getQueryOptions } from '../../utils';

export const getPreviousNode = <
  N extends DescendantOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetPreviousNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined => {
  const getPrevious = (o: GetPreviousNodeOptions<ValueOf<E>>) => {
    try {
      return previous(editor as any, getQueryOptions(editor, o)) as any;
    } catch {}
  };

  if (options?.sibling) {
    const path = getQueryOptions(editor, options).at;

    if (!path) return;

    try {
      const previousPath = Path.previous(path);
      const previousNode = editor.api.node(previousPath);

      return previousNode as TNodeEntry<N>;
    } catch {
      return;
    }
  }
  if (!(options?.id && options?.block)) {
    return getPrevious(options as any);
  }

  const block = editor.api.find({
    id: options.id,
  });

  if (!block) return;

  // both id and block are defined
  const prevEntry = getPrevious({ at: block[1], block: true });

  return prevEntry ? (prevEntry as any) : ([null, [-1]] as any);
};
