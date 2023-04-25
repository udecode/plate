import { Data, NoData } from '@udecode/plate-combobox';
import { PlateEditor, TElement, Value } from '@udecode/plate-common';
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
  inputCreation?: { key: string; value: string };
  query?: <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ) => boolean;
}
