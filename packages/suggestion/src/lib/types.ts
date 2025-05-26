import type { UnknownObject } from '@udecode/plate';

// TODO
export interface SuggestionEditorProps {
  activeSuggestionId?: string | null;
  isSuggesting?: boolean;
}

export interface SuggestionUser extends UnknownObject {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type TResolvedSuggestion = {
  createdAt: Date;
  keyId: string;
  suggestionId: string;
  type: 'insert' | 'remove' | 'replace' | 'update';
  userId: string;
  newProperties?: any;
  newText?: string;
  properties?: any;
  text?: string;
};

export interface TSuggestion extends UnknownObject {
  id: string;

  isAccepted?: boolean;

  isRejected?: boolean;
}
