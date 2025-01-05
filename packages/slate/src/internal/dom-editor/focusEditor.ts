import { DOMEditor } from 'slate-dom';

import type { At } from '../../types';
import type { TEditor } from '../../interfaces/editor';

export const focusEditor = (editor: TEditor, target?: At) => {
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
