import {
  Deserialize,
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// useMention options
export interface UseMentionOptions extends MentionPluginOptions {
  // Character triggering the mention select
  trigger?: string;
  // Maximum number of suggestions
  maxSuggestions?: number;
  // Function to match mentionnables for a given search
  mentionableFilter?: (
    search: string
  ) => (mentionable: MentionNodeData) => boolean;
  // Regex Pattern of a mentionable. Some may want to match emails, so default \W is not enough
  mentionableSearchPattern?: string;

  // Insert space after mention (defaults to false)
  insertSpaceAfterMention?: boolean;
}

// Data of Element node
export interface MentionNodeData {
  value: string;
  [key: string]: any;
}
// Element node
export interface MentionNode extends ElementWithAttributes, MentionNodeData {}

export type MentionKeyOption = 'mention';

// Plugin options
export type MentionPluginOptionsValues = RenderNodeOptions &
  NodeToProps<MentionNode> &
  Deserialize;
export type MentionPluginOptionsKeys = keyof MentionPluginOptionsValues;
export type MentionPluginOptions<
  Value extends MentionPluginOptionsKeys = MentionPluginOptionsKeys
> = Partial<Record<MentionKeyOption, Pick<MentionPluginOptionsValues, Value>>>;

// renderElement options
export type MentionRenderElementOptionsKeys = MentionPluginOptionsKeys;
export interface MentionRenderElementOptions
  extends MentionPluginOptions<MentionRenderElementOptionsKeys> {}

// deserialize options
export interface MentionDeserializeOptions
  extends MentionPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface WithMentionOptions extends MentionPluginOptions<'type'> {}
