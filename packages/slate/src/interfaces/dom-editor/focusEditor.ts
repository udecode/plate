import { DOMEditor } from 'slate-dom';

import type { At } from '../../types';
import type { TEditor } from '../editor';

import { withoutNormalizing } from '../editor';
import { select } from '../transforms';

export const focusEditor = (editor: TEditor, target?: At) => {
  if (target) {
    withoutNormalizing(editor, () => {
      editor.deselect();
      select(editor, target);
    });
  }

  // From slate-react 0.99.0, setTimeout is mandatory to focus the editor after a transform.
  // setTimeout(() => {
  DOMEditor.focus(editor as any);
  // }, 0);
};
