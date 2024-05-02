import type { Data, NoData } from '@udecode/plate-combobox';
import type { PlateEditor, TElement } from '@udecode/plate-common';

import type { CreateMentionNode } from './getMentionOnSelectItem';

export interface TMentionElement extends TElement {
  value: string;
}

export interface TMentionInputElement extends TElement {
  trigger: string;
}

export interface MentionPlugin<TData extends Data = NoData> {
  createMentionNode?: CreateMentionNode<TData>;
  id?: string;
  inputCreation?: { key: string; value: string };
  insertSpaceAfterMention?: boolean;
  query?: (editor: PlateEditor) => boolean;
  trigger?: string;
  triggerPreviousCharPattern?: RegExp;
}
