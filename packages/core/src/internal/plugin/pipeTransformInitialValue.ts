import type { SlateEditor } from '../../lib/editor';

import { getEditorPlugin } from '../../lib/plugin';
import { isEditOnly } from './isEditOnlyDisabled';

/** Transform initial value from editor plugins before the editor is ready. */
export const pipeTransformInitialValue = (editor: SlateEditor) => {
  const value = editor.meta.isNormalizing;

  editor.meta.isNormalizing = true;

  editor.meta.pluginCache.transformInitialValue.forEach((key) => {
    const p = editor.getPlugin({ key });

    if (isEditOnly(editor.dom.readOnly, p, 'transformInitialValue')) {
      return;
    }

    if (!p.transformInitialValue && !p.normalizeInitialValue) {
      return;
    }

    const ctx = {
      ...getEditorPlugin(editor, p),
      value: editor.children,
    } as any;

    if (p.transformInitialValue) {
      const nextValue = p.transformInitialValue(ctx);

      if (nextValue === undefined) {
        throw new Error(
          `Plugin "${key}" transformInitialValue must return the next value.`
        );
      }

      editor.children = nextValue;
      return;
    }

    const nextValue = p.normalizeInitialValue?.(ctx);

    if (nextValue !== undefined) {
      editor.children = nextValue;
    }
  });

  editor.meta.isNormalizing = value;
};
