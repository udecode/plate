import type { Data, NoData } from '@udecode/plate-combobox';
import type { PlateEditor, TElement } from '@udecode/plate-common';

import type { CreateSlashNode } from './getSlashOnSelectItem';

export interface TSlashElement extends TElement {
  value: string;
}

export interface TSlashInputElement extends TElement {
  trigger: string;
}

export interface SlashRule {
  key: string;
  onTrigger: (editor: PlateEditor, key: string) => void;
  text: React.ReactNode;
}

export interface SlashPlugin<TData extends Data = NoData> {
  createSlashNode?: CreateSlashNode<TData>;
  id?: string;
  inputCreation?: { key: string; value: string };
  insertSpaceAfterSlash?: boolean;
  query?: (editor: PlateEditor) => boolean;
  rules?: SlashRule[];
  trigger?: string;
  triggerPreviousCharPattern?: RegExp;
}
