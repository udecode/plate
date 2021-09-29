import { SPEditor } from '@udecode/plate-core';
import { IComboboxItem } from '../components/Combobox.types';

export type ComboboxOnSelectItem = (
  editor: SPEditor,
  item: IComboboxItem
) => any;

// export type ComboboxOnChange = (
//   editor: SPEditor,
//   options: { search: string }
// ) => (value: TNode[]) => boolean | void;
//
// export interface ComboboxPlatePlugin extends PlatePlugin {
//   combobox: {
//     key: string;
//     trigger: string;
//   };
// }
