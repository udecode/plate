import type {
  EditorCorrection,
  EditorCorrectionContext,
  NodeEntry,
  Value,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { normalizeNodeMatch } from '../utils/node-match';
import { isEditorContent } from './content';
import {
  getCorrectionUpdateView,
  getMutationVersion,
  withDraftSource,
} from './public-state';

export const matchesEditorCorrection = (
  entry: NodeEntry,
  correction: EditorCorrection
) => {
  const [node, path] = entry;
  const { query } = correction;

  if (query === 'root') return path.length === 0;
  if (path.length === 0) return false;

  const match = query && normalizeNodeMatch(query.type, query.match);

  return match ? match(node, path) : true;
};

/** Run one registered semantic correction against one matching node. */
export const runEditorCorrection = <
  V extends Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>,
  entry: NodeEntry,
  correction: EditorCorrection<Editor<V, TPlugins>>
) => {
  // A non-content entry, such as a struck suggestion, stays as recorded until
  // its capability decides it.
  if (!isEditorContent(editor, entry[0])) return false;

  const before = getMutationVersion(editor);

  withDraftSource(editor, 'correction', () =>
    correction.correct({
      editor,
      entry,
      tx: getCorrectionUpdateView(editor),
    } as EditorCorrectionContext<Editor<V, TPlugins>>)
  );

  return getMutationVersion(editor) !== before;
};
