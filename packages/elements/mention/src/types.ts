import {
  SlatePluginKey,
  SPEditor,
  TElement,
} from '@udecode/slate-plugins-core';
import { Range } from 'slate';

export interface MentionNodeData {
  value: string;
  [key: string]: any;
}

export type MentionNode = TElement<MentionNodeData>;

// useMention options
export interface MentionPluginOptions extends SlatePluginKey {
  mentionables?: MentionNodeData[];

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

export interface GetMentionSelectProps {
  /**
   * Range from the mention trigger to the cursor
   */
  at: Range | null;

  /**
   * List of mentionable items
   */
  options: MentionNodeData[];

  /**
   * Index of the selected option
   */
  valueIndex: number;

  /**
   * Callback called when clicking on a mention option
   */
  onClickMention?: (editor: SPEditor, option: MentionNodeData) => void;

  searchValue: string;
}
