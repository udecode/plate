import type { BaseEditor } from '../../lib/editor';

import { getEditorPlugin } from '../../lib/plugin';
import { isEditOnly } from './isEditOnlyDisabled';

/** Transform initial value from editor plugins before the editor is ready. */
export const pipeTransformInitialValue = (editor: BaseEditor) => {
  const value = editor.runtime.isNormalizing;

  editor.runtime.isNormalizing = true;

  editor.runtime.pluginCache.transformInitialValue.forEach((key) => {
    const p = editor.getPlugin({ key });

    if (isEditOnly(editor.api.dom.isReadOnly(), p, 'transformInitialValue')) {
      return;
    }

    if (!p.transformInitialValue) {
      return;
    }

    const ctx = {
      ...getEditorPlugin(editor, p),
      value: editor.read.children(),
    } as any;

    if (p.transformInitialValue) {
      const nextValue = p.transformInitialValue(ctx);

      if (nextValue === undefined) {
        throw new Error(
          `Plugin "${key}" transformInitialValue must return the next value.`
        );
      }

      editor.update.value.replace({ children: nextValue, selection: null });
    }
  });

  editor.runtime.isNormalizing = value;
};
