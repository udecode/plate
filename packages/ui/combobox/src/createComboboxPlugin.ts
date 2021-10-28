import { PlatePlugin } from '@udecode/plate-core';
import { getComboboxOnChange } from './getComboboxOnChange';
import { getComboboxOnKeyDown } from './getComboboxOnKeyDown';

export const createComboboxPlugin = (): PlatePlugin => ({
  onChange: getComboboxOnChange(),
  onKeyDown: getComboboxOnKeyDown(),
});
