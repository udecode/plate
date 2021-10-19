import { PlatePlugin } from '@udecode/plate-core';
import { getComboboxOnKeyDown } from './getComboboxOnKeyDown';

export const createComboboxPlugin = (): PlatePlugin => ({
  onKeyDown: getComboboxOnKeyDown(),
});
