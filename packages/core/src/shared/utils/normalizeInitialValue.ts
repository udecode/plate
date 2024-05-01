import type { Value } from '@udecode/slate';

import cloneDeep from 'lodash/cloneDeep.js';
import isEqual from 'lodash/isEqual.js';

import type { PlateEditor } from '../types';

/** Normalize initial value from editor plugins. Set into plate store if diff. */
export const normalizeInitialValue = <V extends Value>(
  editor: PlateEditor<V>,
  value: V
) => {
  let normalizedValue = cloneDeep(value);

  editor.plugins.forEach((p) => {
    const _normalizedValue = p.normalizeInitialValue?.(normalizedValue);

    if (_normalizedValue) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      normalizedValue = _normalizedValue;
    }
  });

  if (!isEqual(value, normalizedValue)) {
    return normalizedValue;
  }
};
