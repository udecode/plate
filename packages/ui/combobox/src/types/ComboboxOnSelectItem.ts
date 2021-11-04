import { PlateEditor } from '@udecode/plate-core';
import { TComboboxItem } from '../components';

export type ComboboxOnSelectItem<TData> = (
  editor: PlateEditor,
  item: TComboboxItem<TData>
) => any;
