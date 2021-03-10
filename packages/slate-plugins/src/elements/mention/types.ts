import { ElementWithAttributes } from '@udecode/slate-plugins-common';

export interface MentionNodeData {
  value: string;
  [key: string]: any;
}

export interface MentionNode extends ElementWithAttributes, MentionNodeData {}

// useMention options
export interface UseMentionOptions {
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
