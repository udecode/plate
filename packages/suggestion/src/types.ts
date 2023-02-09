import { TText, Value } from '@udecode/plate-core';

export interface SuggestionUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface TSuggestion {
  id: string;

  /**
   * Slate value of the document.
   */
  value: Value;

  /**
   * @default Date.now()
   */
  createdAt: number;

  /**
   * Author id.
   */
  userId: string;

  isAccepted?: boolean;

  isRejected?: boolean;
}

export interface TSuggestionText extends TText {
  suggestion?: boolean;
  suggestionId?: string;
}

export interface SuggestionPlugin {
  hotkey?: string;
}

export interface SuggestionEditorProps {
  isSuggesting?: boolean;
  activeSuggestionId?: string | null;
}
