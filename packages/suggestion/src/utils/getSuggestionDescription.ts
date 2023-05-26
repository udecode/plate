import {
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { getSuggestionNodeEntries } from './getSuggestionNodeEntries';

// TODO: Move to ../types
export type TSuggestionInsertionDescription = {
  type: 'insertion';
  insertedText: string;
};

export type TSuggestionDeletionDescription = {
  type: 'deletion';
  deletedText: string;
};

export type TSuggestionReplacementDescription = {
  type: 'replacement';
  insertedText: string;
  deletedText: string;
};

export type TSuggestionDescription =
  | TSuggestionInsertionDescription
  | TSuggestionDeletionDescription
  | TSuggestionReplacementDescription;

export const getSuggestionDescription = <V extends Value = Value>(
  editor: PlateEditor<V>,
  suggestionId: string
): TSuggestionDescription | undefined => {
  const nodes = Array.from(
    getSuggestionNodeEntries(editor, suggestionId
  )).map(([node]) => node);

  const insertions = nodes.filter((node) => !node.suggestionDeletion);
  const deletions = nodes.filter((node) => node.suggestionDeletion);
  const insertedText = insertions.map((node) => node.text).join('');
  const deletedText = deletions.map((node) => node.text).join('');

  if (insertions.length > 0 && deletions.length > 0) {
    return {
      type: 'replacement',
      insertedText,
      deletedText,
    };
  }

  if (insertions.length > 0) {
    return {
      type: 'insertion',
      insertedText,
    };
  }

  if (deletions.length > 0) {
    return {
      type: 'deletion',
      deletedText,
    };
  }

  return undefined;
};
