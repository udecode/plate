import type { MarkdownEditor } from '@platejs/markdown';
import { diffToSuggestions } from '@platejs/suggestion';
import type { Element } from '@platejs/plite';
import type { PlateEditor } from '@platejs/core/react';

import { withAIBatch } from '../../../lib/transforms/withAIBatch';
import {
  withoutSuggestionAndComments,
  withTransient,
} from './applyAISuggestions';

export type TableCellUpdate = {
  content: string;
  id: string;
};

/**
 * Apply AI-generated content to a table cell as diff suggestions. Finds the
 * cell by ID, deserializes the markdown content, computes diff, and replaces
 * the cell's children with suggestion-marked nodes.
 */
export const applyTableCellSuggestion = (
  editor: MarkdownEditor<PlateEditor>,
  cellUpdate: TableCellUpdate
) => {
  const { content, id } = cellUpdate;

  // Find the cell by id
  const cellEntry = editor.read.nodes.find<Element>({
    at: [],
    match: { id },
  });

  if (!cellEntry) {
    console.warn(`Table cell with id "${id}" not found`);
    return;
  }

  const [cell, cellPath] = cellEntry;

  // Get original cell children (without suggestion marks)
  const originalChildren = withoutSuggestionAndComments(cell.children);

  // Deserialize AI content to nodes
  const aiNodes = editor.api.markdown.deserialize(content).children;

  // Compute diff
  const diffNodes = diffToSuggestions(editor, originalChildren, aiNodes, {
    ignoreProps: ['id'],
  });

  // Add transient suggestion key to all nodes
  const transientDiffNodes = withTransient(diffNodes);

  withAIBatch(editor, (tx) => {
    tx.nodes.replaceChildren(transientDiffNodes, { at: cellPath });
  });
};
