import { SPEditor } from '@udecode/plate-core';
import { IComboboxItem } from '../components/Combobox.types';

export type ComboboxOnSelectItem = (
  editor: SPEditor,
  item: IComboboxItem
) => any;
