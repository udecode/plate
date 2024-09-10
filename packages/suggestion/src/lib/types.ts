import type { TText, UnknownObject } from '@udecode/plate-common';

export interface SuggestionUser extends UnknownObject {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface TSuggestion extends UnknownObject {
  /** @default Date.now() */
  createdAt: number;

  id: string;

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
  activeSuggestionId?: null | string;
  isSuggesting?: boolean;
}
