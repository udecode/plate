import type { TElement, TText, UnknownObject } from '@udecode/plate';

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

export type TInlineSuggestionData =
  | TInsertSuggestionData
  | TRemoveSuggestionData
  | TUpdateSuggestionData;

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

export type TSuggestionData = {
  id: string;
  createdAt: number;
  type: 'insert' | 'remove';
  userId: string;
  isLineBreak?: boolean;
};
export interface TSuggestionElement extends TElement {
  suggestion: TSuggestionData;
}

export type TSuggestionText = TText & {
  [key: string]: TInlineSuggestionData | boolean | string;
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
