import { SPEditor } from '@udecode/plate-core';
import { TComboboxItem } from '../components';

export type ComboboxOnSelectItem<TData> = (
  editor: SPEditor,
  item: TComboboxItem<TData>
) => any;
