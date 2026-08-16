import type {
  EditorCorrection,
  EditorCorrectionContext,
  NodeEntry,
  Value,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { normalizeNodeMatch } from '../utils/node-match';
import { getCorrectionUpdateView, getMutationVersion } from './public-state';

export const matchesEditorCorrection = (
  entry: NodeEntry,
  correction: EditorCorrection
) => {
  const [node, path] = entry;
  const query = correction.query;

  if (query === 'root') return path.length === 0;
  if (path.length === 0) return false;

  const match = query && normalizeNodeMatch(query.type, query.match);

  return match ? match(node, path) : true;
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
