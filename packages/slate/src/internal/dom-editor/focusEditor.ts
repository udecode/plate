import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';
import type { At } from '../../types';

export const focusEditor = (editor: Editor, target?: At) => {
  if (target) {
    editor.tf.withoutNormalizing(() => {
      editor.tf.deselect();
      editor.tf.select(target);
    });
  }

  // From slate-react 0.99.0, setTimeout is mandatory to focus the editor after a transform.
  // setTimeout(() => {
  DOMEditor.focus(editor as any);
  // }, 0);
};
