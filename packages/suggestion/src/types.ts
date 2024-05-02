import { TText, UnknownObject } from '@udecode/plate-common/server';

export interface SuggestionUser extends UnknownObject {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface TSuggestion extends UnknownObject {
  id: string;

  /**
   * @default Date.now()
   */
  createdAt: number;

  isAccepted?: boolean;

  isRejected?: boolean;
}

export interface TSuggestionText extends TText {
  suggestion?: boolean;
  suggestionId?: string;

  suggestionDeletion?: boolean;
}

export interface SuggestionPlugin {
  hotkey?: string;
  currentUserId?: string;
}

export interface SuggestionEditorProps {
  isSuggesting?: boolean;
  activeSuggestionId?: string | null;
}
