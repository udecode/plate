import {
  type EditorCorrection,
  type EditorCorrectionContext,
  NodeApi,
  type NodeEntry,
  type Value,
} from '../interfaces';
import type { Editor } from '../interfaces/editor';
import { getCorrectionUpdateView, getMutationVersion } from './public-state';

export const matchesEditorCorrection = (
  entry: NodeEntry,
  correction: EditorCorrection
) => {
  const [node, path] = entry;
  const query = correction.query;

  return query === 'root'
    ? path.length === 0
    : path.length > 0 && (!query || NodeApi.matches(node, query, path));
};

/** Run one registered semantic correction against one matching node. */
export const runEditorCorrection = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  entry: NodeEntry,
  correction: EditorCorrection<Editor<V, TExtensions>>
) => {
  const before = getMutationVersion(editor);

  correction.correct({
    editor,
    entry,
    tx: getCorrectionUpdateView(editor),
  } as EditorCorrectionContext<Editor<V, TExtensions>>);

  return getMutationVersion(editor) !== before;
};
