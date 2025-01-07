import { DOMEditor } from 'slate-dom';

import type { Editor, FocusEditorOptions } from '../../interfaces/editor';
import type { At } from '../../types';

export const focusEditor = (
  editor: Editor,
  { at, edge, retries = 5 }: FocusEditorOptions = {}
) => {
  const reselect = (at: At) => {
    editor.tf.withoutNormalizing(() => {
      editor.tf.deselect();
      editor.tf.select(at);
    });
  };

  if (edge) {
    const target: At | null =
      edge === 'startEditor' || edge === 'endEditor'
        ? []
        : (at ?? editor.selection);

    if (target) {
      reselect(
        edge === 'start' ? editor.api.start(target)! : editor.api.end(target)!
      );
    }
  } else if (at) {
    reselect(at);
  }

  DOMEditor.focus(editor as any, { retries });
};
