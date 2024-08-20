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

export type MentionPluginOptions<
  TItem extends TMentionItemBase = TMentionItemBase,
> = {
  createMentionNode?: (
    item: TItem,
    search: string
  ) => TNodeProps<TMentionElement>;
  insertSpaceAfterMention?: boolean;
} & TriggerComboboxPluginOptions;
