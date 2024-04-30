import { Data, NoData } from '@udecode/plate-combobox';
import { PlateEditor, TElement } from '@udecode/plate-common';

import { CreateSlashNode } from './getSlashOnSelectItem';

export interface TSlashElement extends TElement {
  value: string;
}

export interface TSlashInputElement extends TElement {
  trigger: string;
}

export interface SlashRule {
  key: string;
  text: string;
  onTrigger: (editor: any, key: string) => void;
}

export interface SlashPlugin<TData extends Data = NoData> {
  createSlashNode?: CreateSlashNode<TData>;
  id?: string;
  insertSpaceAfterSlash?: boolean;
  trigger?: string;
  triggerPreviousCharPattern?: RegExp;
  inputCreation?: { key: string; value: string };
  query?: (editor: PlateEditor) => boolean;
  rules?: SlashRule[];
}
