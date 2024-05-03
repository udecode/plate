import { TriggerComboboxPlugin } from '@udecode/plate-combobox';
import { TElement, TNodeProps } from '@udecode/plate-common';

export interface TMentionItemBase {
  text: string;
}

export interface TMentionInputElement extends TElement {
  trigger: string;
}

export interface TMentionElement extends TElement {
  value: string;
}

export interface MentionPlugin<
  TItem extends TMentionItemBase = TMentionItemBase,
> extends TriggerComboboxPlugin {
  createMentionNode?: (
    item: TItem,
    search: string
  ) => TNodeProps<TMentionElement>;
  insertSpaceAfterMention?: boolean;
}
