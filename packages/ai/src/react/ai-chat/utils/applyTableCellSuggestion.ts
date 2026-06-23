import { deserializeMd } from '@platejs/markdown';
import { diffToSuggestions } from '@platejs/suggestion';
import type { Descendant, Element, Value } from '@platejs/slate';
import { type SlateEditor, ElementApi } from 'platejs';

import {
  withoutSuggestionAndComments,
  withTransient,
} from './applyAISuggestions';

export type TableCellUpdate = {
  content: string;
  id: string;
};

const replaceChildrenAtPath = (
  nodes: Descendant[],
  path: number[],
  children: Descendant[]
): Descendant[] => {
  const [index, ...restPath] = path;

  if (index === undefined) return nodes;

  return nodes.map((node, nodeIndex) => {
    if (nodeIndex !== index) return node;

    if (!ElementApi.isElement(node)) return node;

    if (restPath.length === 0) {
      return { ...node, children };
    }

    return {
      ...node,
      children: replaceChildrenAtPath(node.children, restPath, children),
    };
  });
};

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

  const [cell, cellPath] = cellEntry as [Element, number[]];

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
  editor.update((tx) => {
    tx.value.replace({
      children: replaceChildrenAtPath(
        editor.children,
        cellPath,
        transientDiffNodes
      ) as Value,
    });
  });
};
