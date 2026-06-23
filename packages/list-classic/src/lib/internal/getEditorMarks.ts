import type { BasePlateEditor } from '@platejs/core';
import type { EditorCoreStateView, EditorMarks } from '@platejs/plite';

export const getEditorMarks = (editor: BasePlateEditor): EditorMarks =>
  ('read' in editor && typeof editor.read === 'function'
    ? editor.read((state: EditorCoreStateView) => state.marks.get())
    : (
        editor.api as {
          marks?: () => EditorMarks;
        }
      ).marks?.()) ?? {};
