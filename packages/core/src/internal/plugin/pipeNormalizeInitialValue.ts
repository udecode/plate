import type { SlateEditor } from '../../lib/editor';

import { getEditorPlugin } from '../../lib/plugin';
import { isEditOnly } from './isEditOnlyDisabled';

/** Normalize initial value from editor plugins. Set into plate store if diff. */
export const pipeNormalizeInitialValue = (editor: SlateEditor) => {
  editor.pluginList.forEach((p) => {
    if (isEditOnly(editor.dom.readOnly, p, 'normalizeInitialValue')) {
      return;
    }

    p.normalizeInitialValue?.({
      ...getEditorPlugin(editor, p),
      value: editor.children,
    } as any);
  });
};
