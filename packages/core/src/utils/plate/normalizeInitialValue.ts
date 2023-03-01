import { cloneDeep } from 'lodash';
import isEqual from 'lodash/isEqual';
import { Value } from '../../../../slate-utils/src/slate/index';
import { PlateEditor } from '../../types/index';

/**
 * Normalize initial value from editor plugins. Set into plate store if diff.
 */
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
