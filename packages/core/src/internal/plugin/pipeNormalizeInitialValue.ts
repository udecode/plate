import type { SlateEditor } from '../../lib/editor';

import { getEditorPlugin } from '../../lib/plugin';
import { isEditOnly } from './isEditOnlyDisabled';

/** Normalize initial value from editor plugins. Set into plate store if diff. */
export const pipeNormalizeInitialValue = (editor: SlateEditor) => {
  const value = editor.meta.isNormalizing;

  editor.meta.isNormalizing = true;

  editor.meta.pluginCache.normalizeInitialValue.forEach((key) => {
    const p = editor.getPlugin({ key });

    if (isEditOnly(editor.dom.readOnly, p, 'normalizeInitialValue')) {
      return;
    }

    p.normalizeInitialValue?.({
      ...getEditorPlugin(editor, p),
      value: editor.children,
    } as any);
  });

  editor.meta.isNormalizing = value;
};
