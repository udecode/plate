import type { UnknownObject } from '@udecode/utils';

// TODO
export type SuggestionEditorProps = {
  activeSuggestionId?: string | null;
  isSuggesting?: boolean;
};

export type SuggestionUser = UnknownObject & {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type TResolvedSuggestion = {
  createdAt: Date;
  keyId: string;
  suggestionId: string;
  type: 'insert' | 'remove' | 'replace' | 'update';
  userId: string;
  newProperties?: Record<string, unknown>;
  newText?: string;
  properties?: Record<string, unknown>;
  text?: string;
};

export type TSuggestionDescription =
  | ({
      deletedText: string;
      type: 'deletion';
    } & TSuggestionCommonDescription)
  | ({
      insertedText: string;
      type: 'insertion';
    } & TSuggestionCommonDescription)
  | ({
      deletedText: string;
      insertedText: string;
      type: 'replacement';
    } & TSuggestionCommonDescription);

type TSuggestionCommonDescription = {
  suggestionId: string;
  userId: string;
};

export interface TSuggestion extends UnknownObject {
  id: string;

  isAccepted?: boolean;

  isRejected?: boolean;
}
