import { SPEditor } from '@udecode/plate-core';
import { ComboboxItemData } from '../components/Combobox.types';

export type ComboboxOnSelectItem = (
  editor: SPEditor,
  item: ComboboxItemData
) => any;
