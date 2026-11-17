import type { Value } from '../interfaces';
import type {
  ContentSlice as ContentSliceType,
  Editor,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { getDefined } from '../internal/get-defined';
import { ContentSlice } from './content-slice';
import { rewriteContentRootReferences } from './content-slice-roots';
import { nextCopiedRootName, takenRootNames } from './public-state';

export const renewContentSlice = <V extends Value>(
  editor: Editor<V>,
  slice: ContentSliceType<V>
): ContentSliceType<V> => {
  if (!slice.roots || Object.keys(slice.roots).length === 0) return slice;

  const existingRoots = takenRootNames(editor);
  const remapped = new Map<string, string>();

  for (const root of Object.keys(slice.roots).sort()) {
    remapped.set(root, nextCopiedRootName(editor, root, existingRoots));
  }

  const rewrite = (children: readonly Descendant[]) =>
    rewriteContentRootReferences(
      editor,
      children,
      (root) => remapped.get(root) ?? root
    );
  const roots = Object.freeze(
    Object.fromEntries(
      [...remapped].map(([source, target]) => [
        target,
        rewrite(getDefined(slice.roots)[source]),
      ])
    )
  );

  return ContentSlice.fromJSON<V>({
    content: rewrite(slice.content),
    openEnd: slice.openEnd,
    openStart: slice.openStart,
    roots,
  });
};
