import type { TriggerComboboxPluginOptions } from '@udecode/plate-combobox';
import type { TElement, TNodeProps } from '@udecode/plate-common';

export interface TMentionItemBase {
  text: string;
}

export interface TMentionInputElement extends TElement {
  trigger: string;
}

export interface TMentionElement extends TElement {
  value: string;
}

export interface MentionPluginOptions<
  TItem extends TMentionItemBase = TMentionItemBase,
> extends TriggerComboboxPluginOptions {
  createMentionNode?: (
    item: TItem,
    search: string
  ) => TNodeProps<TMentionElement>;
  insertSpaceAfterMention?: boolean;
}
