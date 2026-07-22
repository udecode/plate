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
export const runEditorCorrection = <V extends Value>(
  editor: Editor<V>,
  entry: NodeEntry,
  correction: EditorCorrection<Editor<V>>
) => {
  const before = getMutationVersion(editor);

  correction.correct({
    editor,
    entry,
    tx: getCorrectionUpdateView(editor),
  } as EditorCorrectionContext<Editor<V>>);

  return getMutationVersion(editor) !== before;
};
