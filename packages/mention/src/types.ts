import { Data, NoData } from '@udecode/plate-combobox';
import { PlateEditor, TElement } from '@udecode/plate-common';

import { CreateMentionNode } from './getMentionOnSelectItem';

export interface TMentionElement extends TElement {
  value: string;
}

export interface TMentionInputElement extends TElement {
  trigger: string;
}

export interface MentionPlugin<TData extends Data = NoData> {
  createMentionNode?: CreateMentionNode<TData>;
  id?: string;
  insertSpaceAfterMention?: boolean;
  trigger?: string;
  triggerPreviousCharPattern?: RegExp;
  inputCreation?: { key: string; value: string };
  query?: (editor: PlateEditor) => boolean;
}
