import type { TriggerComboboxPlugin } from '@udecode/plate-combobox';
import type { TElement, TNodeProps } from '@udecode/plate-common/server';

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
