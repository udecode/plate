import cloneDeep from 'lodash/cloneDeep.js';
import isEqual from 'lodash/isEqual.js';

import type { SlateEditor } from '../editor';

import { getPluginContext } from '../plugin';

/** Normalize initial value from editor plugins. Set into plate store if diff. */
export const pipeNormalizeInitialValue = (editor: SlateEditor) => {
  const value = editor.children;
  let normalizedValue = cloneDeep(value);

  editor.pluginList.forEach((p) => {
    const _normalizedValue = p.normalizeInitialValue?.({
      ...getPluginContext(editor, p),
      value: normalizedValue,
    } as any);

    if (_normalizedValue) {
      normalizedValue = _normalizedValue;
    }
  });

  if (!isEqual(value, normalizedValue) && normalizedValue) {
    editor.children = normalizedValue;
  }
};
