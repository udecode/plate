import type { TText, UnknownObject } from '@udecode/plate-common';

export interface SuggestionUser extends UnknownObject {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface TSuggestion extends UnknownObject {
  id: string;

  /** @default Date.now() */
  createdAt: number;

  isAccepted?: boolean;

  isRejected?: boolean;
}

export interface TSuggestionText extends TText {
  suggestion?: boolean;
  suggestionDeletion?: boolean;
  suggestionId?: string;
}

// TODO
export interface SuggestionEditorProps {
  activeSuggestionId?: string | null;
  isSuggesting?: boolean;
}
