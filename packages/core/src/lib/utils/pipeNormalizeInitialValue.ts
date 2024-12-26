import type { SlateEditor } from '../editor';

import { getEditorPlugin } from '../plugin';

/** Normalize initial value from editor plugins. Set into plate store if diff. */
export const pipeNormalizeInitialValue = (editor: SlateEditor) => {
  editor.pluginList.forEach((p) => {
    p.normalizeInitialValue?.({
      ...getEditorPlugin(editor, p),
      value: editor.children,
    } as any);
  });
};
