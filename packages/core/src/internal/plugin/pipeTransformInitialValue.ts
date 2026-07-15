import type { BaseEditor } from '../../lib/editor';
import { replace as replaceEditorSnapshot } from '@platejs/plite/internal';

import { getEditorPlugin } from '../../lib/plugin';
import { isEditOnly } from './isEditOnlyDisabled';

/** Transform initial value from editor plugins before the editor is ready. */
export const pipeTransformInitialValue = (editor: BaseEditor) => {
  const value = editor.runtime.isNormalizing;

  editor.runtime.isNormalizing = true;

  editor.runtime.pluginCache.transformInitialValue.forEach((key) => {
    const p = editor.getPlugin({ key });

    if (isEditOnly(editor.read.view.isReadOnly(), p, 'transformInitialValue')) {
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

      replaceEditorSnapshot(editor, {
        children: nextValue,
        selection: editor.read.selection(),
      });
    }
  });

  editor.runtime.isNormalizing = value;
};
