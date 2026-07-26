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
