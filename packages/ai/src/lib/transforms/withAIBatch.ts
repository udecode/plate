import type { BasePlateEditor } from 'platejs';

import { type EditorHistoryBatch, getEditorHistory } from '../internal/history';

export type AIBatch = EditorHistoryBatch & {
  ai?: boolean;
};

export const withAIBatch = (
  editor: BasePlateEditor,
  fn: () => void,
  {
    split,
  }: {
    split?: boolean;
  } = {}
) => {
  if (split) {
    editor.api.history.withNewBatch(fn);
  } else {
    editor.api.history.withMerging(fn);
  }

  const lastBatch = getEditorHistory(editor).undos.at(-1) as
    | AIBatch
    | undefined;

  if (lastBatch) {
    lastBatch.ai = true;
  }
};
