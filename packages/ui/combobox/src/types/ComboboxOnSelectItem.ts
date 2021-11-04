import { SPEditor } from '@udecode/plate-core';
import { ComboboxItemData } from '../components/Combobox.types';

export type ComboboxOnSelectItem = (
  editor: PlateEditor,
  item: ComboboxItemData
) => any;
