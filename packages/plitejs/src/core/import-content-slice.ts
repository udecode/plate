import type { Value } from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { ContentSlice } from './content-slice';
import { getEditorRuntimeRoot, getEditorSchema } from './editor-runtime';

const sameNodes = (left: readonly unknown[], right: readonly unknown[]) =>
  left.length === right.length &&
  left.every((node, index) => node === right[index]);

/**
 * Prepare content that arrives from outside the editor, such as clipboard
 * data or an external drop. The receiving schema drops every property it
 * drops on copy, such as review marks, from the main content and from every
 * named root the slice carries.
 *
 * @internal
 */
export const importContentSlice = <V extends Value>(
  editor: Editor,
  slice: ContentSlice<V>
): ContentSlice<V> => {
  const schema = getEditorSchema(editor);
  const content = schema.copyChildren(
    slice.content,
    getEditorRuntimeRoot(editor)
  );
  const roots = slice.roots
    ? Object.fromEntries(
        Object.entries(slice.roots).map(([root, children]) => [
          root,
          schema.copyChildren(children, root),
        ])
      )
    : undefined;

  if (
    sameNodes(content, slice.content) &&
    (!roots ||
      Object.entries(roots).every(([root, children]) =>
        sameNodes(children, slice.roots?.[root] ?? [])
      ))
  ) {
    return slice;
  }

  return ContentSlice.fromJSON<V>({
    content,
    openEnd: slice.openEnd,
    openStart: slice.openStart,
    ...(roots ? { roots } : {}),
  });
};
