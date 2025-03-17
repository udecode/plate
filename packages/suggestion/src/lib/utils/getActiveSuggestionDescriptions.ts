import type { SlateEditor } from '@udecode/plate';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey, getSuggestionUserIds } from './getSuggestionKeys';
import { getSuggestionNodeEntries } from './getSuggestionNodeEntries';

export type TSuggestionCommonDescription = {
  suggestionId: string;
  userId: string;
};

export type TSuggestionDeletionDescription = {
  deletedText: string;
  type: 'deletion';
} & TSuggestionCommonDescription;

export type TSuggestionDescription =
  | TSuggestionDeletionDescription
  | TSuggestionInsertionDescription
  | TSuggestionReplacementDescription;

// TODO: Move to ../types
export type TSuggestionInsertionDescription = {
  insertedText: string;
  type: 'insertion';
} & TSuggestionCommonDescription;

export type TSuggestionReplacementDescription = {
  deletedText: string;
  insertedText: string;
  type: 'replacement';
} & TSuggestionCommonDescription;

/**
 * Get the suggestion descriptions of the selected node. A node can have
 * multiple suggestions (multiple users). Each description maps to a user
 * suggestion.
 */
export const getActiveSuggestionDescriptions = (
  editor: SlateEditor
): TSuggestionDescription[] => {
  const aboveEntry = editor.getApi(BaseSuggestionPlugin).suggestion.node({
    isText: true,
  });

  if (!aboveEntry) return [];

  const aboveNode = aboveEntry[0];
  const suggestionId = editor
    .getApi(BaseSuggestionPlugin)
    .suggestion.nodeId(aboveNode);

  if (!suggestionId) return [];

  const userIds = getSuggestionUserIds(aboveNode);

  return userIds.map((userId) => {
    const nodes = Array.from(
      getSuggestionNodeEntries(editor, suggestionId, {
        match: (n: any) => n[getSuggestionKey(userId)],
      })
    ).map(([node]) => node);
    const insertions = nodes.filter((node) => !node.suggestionDeletion);
    const deletions = nodes.filter((node) => node.suggestionDeletion);
    const insertedText = insertions.map((node) => node.text).join('');
    const deletedText = deletions.map((node) => node.text).join('');

    if (insertions.length > 0 && deletions.length > 0) {
      return {
        deletedText,
        insertedText,
        suggestionId,
        type: 'replacement',
        userId,
      };
    }
    if (deletions.length > 0) {
      return {
        deletedText,
        suggestionId,
        type: 'deletion',
        userId,
      };
    }

    return {
      insertedText,
      suggestionId,
      type: 'insertion',
      userId,
    };
  });
};
