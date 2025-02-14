import type { TText, UnknownObject } from '@udecode/plate';

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

export type TInsertSuggestionData = {
  id: string;
  createdAt: number;
  type: 'insert';
  userId: string;
};

export type TRemoveSuggestionData = {
  id: string;
  createdAt: number;
  type: 'remove';
  userId: string;
};

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

export type TSuggestionData =
  | TInsertSuggestionData
  | TRemoveSuggestionData
  | TUpdateSuggestionData;

export type TSuggestionLineBreak = {
  id: string;
  createdAt: number;
  type: 'insert' | 'remove';
  userId: string;
};

export type TSuggestionText = TText & {
  [key: string]: TSuggestionData | boolean | string;
  suggestion: true;
  text: string;
};

export type TUpdateSuggestionData = {
  id: string;
  createdAt: number;
  type: 'update';
  userId: string;
  newProperties?: any;
  properties?: any;
};
