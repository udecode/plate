import type { BasePlateEditor, TSuggestionText } from 'platejs';

import { getSuggestionKey } from './getSuggestionKeys';
import { getSuggestionApi } from './getSuggestionApi';
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

const getInlineSuggestionType = (
  node: TSuggestionText,
  suggestionKey: string
) => {
  const data = node[suggestionKey];

  return typeof data === 'object' && data !== null ? data.type : undefined;
};

/**
 * Get the suggestion descriptions of the selected node. A node can have
 * multiple suggestions (multiple users). Each description maps to a user
 * suggestion.
 */
export const getActiveSuggestionDescriptions = (
  editor: BasePlateEditor
): TSuggestionDescription[] => {
  const suggestionApi = getSuggestionApi(editor);
  const aboveEntry = suggestionApi.node({
    isText: true,
  });

  if (!aboveEntry) return [];

  const aboveNode = aboveEntry[0];
  const suggestionId = suggestionApi.nodeId(aboveNode);

  if (!suggestionId) return [];

  const suggestionDataList = suggestionApi.dataList(
    aboveNode as TSuggestionText
  );

  return suggestionDataList.map(({ id: activeSuggestionId, userId }) => {
    const suggestionKey = getSuggestionKey(activeSuggestionId);
    const nodes = Array.from(
      getSuggestionNodeEntries(editor, activeSuggestionId)
    ).map(([node]) => node);
    const insertions = nodes.filter(
      (node) => getInlineSuggestionType(node, suggestionKey) === 'insert'
    );
    const deletions = nodes.filter(
      (node) => getInlineSuggestionType(node, suggestionKey) === 'remove'
    );
    const insertedText = insertions.map((node) => node.text).join('');
    const deletedText = deletions.map((node) => node.text).join('');

    if (insertions.length > 0 && deletions.length > 0) {
      return {
        deletedText,
        insertedText,
        suggestionId: activeSuggestionId,
        type: 'replacement',
        userId,
      };
    }
    if (deletions.length > 0) {
      return {
        deletedText,
        suggestionId: activeSuggestionId,
        type: 'deletion',
        userId,
      };
    }

    return {
      insertedText,
      suggestionId: activeSuggestionId,
      type: 'insertion',
      userId,
    };
  });
};
