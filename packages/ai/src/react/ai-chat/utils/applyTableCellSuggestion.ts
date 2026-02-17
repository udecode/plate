import { deserializeMd } from '@platejs/markdown';
import { diffToSuggestions } from '@platejs/suggestion';
import { type SlateEditor, type TElement, ElementApi } from 'platejs';

import {
  withoutSuggestionAndComments,
  withTransient,
} from './applyAISuggestions';

export interface TableCellUpdate {
  content: string;
  id: string;
}

/**
 * Apply AI-generated content to a table cell as diff suggestions. Finds the
 * cell by ID, deserializes the markdown content, computes diff, and replaces
 * the cell's children with suggestion-marked nodes.
 */
export const applyTableCellSuggestion = (
  editor: SlateEditor,
  cellUpdate: TableCellUpdate
) => {
  const { content, id } = cellUpdate;

  // Find the cell by id
  const cellEntry = editor.api.node({
    at: [],
    match: (n) => ElementApi.isElement(n) && n.id === id,
  });

  if (!cellEntry) {
    console.warn(`Table cell with id "${id}" not found`);
    return;
  }

  const [cell, cellPath] = cellEntry as [TElement, number[]];

  // Get original cell children (without suggestion marks)
  const originalChildren = withoutSuggestionAndComments(cell.children);

  // Deserialize AI content to nodes
  const aiNodes = deserializeMd(editor, content);

  // Compute diff
  const diffNodes = diffToSuggestions(editor, originalChildren, aiNodes, {
    ignoreProps: ['id'],
  });

  // Add transient suggestion key to all nodes
  const transientDiffNodes = withTransient(diffNodes);

  // Replace cell children with diff nodes
  editor.tf.replaceNodes(transientDiffNodes, {
    at: cellPath,
    children: true,
  });
};
