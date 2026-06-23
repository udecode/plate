import type { SlateEditor } from '@platejs/core';
import type { EditorCoreStateView, EditorMarks } from '@platejs/slate';

export const getEditorMarks = (editor: SlateEditor): EditorMarks =>
  ('read' in editor && typeof editor.read === 'function'
    ? editor.read((state: EditorCoreStateView) => state.marks.get())
    : (
        editor.api as {
          marks?: () => EditorMarks;
        }
      ).marks?.()) ?? {};
