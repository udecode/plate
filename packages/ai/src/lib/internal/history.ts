import type { Operation, Range, BasePlateEditor } from 'platejs';

export type EditorHistoryBatch = {
  ai?: boolean;
  operations: Operation[];
  selectionBefore?: Range | null;
  shouldAbort?: boolean;
};

type EditorHistory = {
  redos: EditorHistoryBatch[];
  undos: EditorHistoryBatch[];
};

export const getEditorHistory = (editor: BasePlateEditor): EditorHistory =>
  editor.history as EditorHistory;
