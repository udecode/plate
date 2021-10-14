import { SPEditor } from '@udecode/plate-core';
import { ComboboxItemData } from '../components';

export type ComboboxOnSelectItem<TItemData> = (
  editor: SPEditor,
  item: ComboboxItemData<TItemData>
) => any;
