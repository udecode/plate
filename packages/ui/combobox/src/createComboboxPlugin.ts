import { createPluginFactory } from '@udecode/plate-core';
import { getComboboxOnChange } from './getComboboxOnChange';
import { getComboboxOnKeyDown } from './getComboboxOnKeyDown';

export const KEY_COMBOBOX = 'combobox';

export const createComboboxPlugin = createPluginFactory({
  key: KEY_COMBOBOX,
  onChange: getComboboxOnChange(),
  onKeyDown: getComboboxOnKeyDown(),
});
