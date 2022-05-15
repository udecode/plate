import {
  collapseSelection,
  getEndPoint,
  getNodeChildren,
  getNodeEntries,
  getPluginType,
  getPointAfter,
  getPointBefore,
  getStartPoint,
  isCollapsed,
  isElement,
  PlateEditor,
  removeNodes,
  Value,
} from '@udecode/plate-core';
import { Node, Point } from 'slate';
import { ELEMENT_TD, ELEMENT_TH } from './createTablePlugin';

export const withTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const matchCells = (node: Node) => {
    return (
      isElement(node) &&
      (node.type === getPluginType(editor, ELEMENT_TD) ||
        node.type === getPluginType(editor, ELEMENT_TH))
    );
  };

  const { deleteBackward, deleteForward, deleteFragment, insertText } = editor;

  const preventDeleteCell = (
    operation: any,
    pointCallback: any,
    nextPoint: any
  ) => (unit: any) => {
    const { selection } = editor;

    if (isCollapsed(selection)) {
      const [cell] = getNodeEntries(editor, {
        match: matchCells,
      });
      if (cell) {
        // Prevent deletions within a cell
        const [, cellPath] = cell;

        const start = pointCallback(editor, cellPath);

        if (selection && Point.equals(selection.anchor, start)) {
          return;
        }
      } else {
        // Prevent deleting cell when selection is before or after a table
        const next = nextPoint(editor, selection, { unit });
        const _nodes = getNodeEntries(editor, {
          match: matchCells,
          at: next,
        });
        const [nextCell] = Array.from(_nodes);
        if (nextCell) return;
      }
    }

    operation(unit);
  };

  editor.deleteFragment = () => {
    const { selection } = editor;
    let _nodes = getNodeEntries(editor, {
      match: matchCells,
      at: selection?.anchor.path,
    });
    const [start] = Array.from(_nodes);
    _nodes = getNodeEntries(editor, {
      match: matchCells,
      at: selection?.focus.path,
    });
    const [end] = Array.from(_nodes);
    // Skip deletes if they start or end in a table cell, unless start & end in the same cell
    if ((start || end) && start?.[0] !== end?.[0]) {
      const _cells = getNodeEntries(editor, {
        match: matchCells,
      });
      // Clear cells content
      const cells = Array.from(_cells);
      for (const [, path] of cells) {
        for (const [, childPath] of getNodeChildren(editor, path, {
          reverse: true,
        })) {
          removeNodes(editor, { at: childPath });
        }
      }
      collapseSelection(editor);
      return;
    }
    deleteFragment();
  };

  editor.insertText = (text) => {
    const { selection } = editor;
    const _starts = getNodeEntries(editor, {
      match: matchCells,
      at: selection?.anchor.path,
    });
    const [start] = Array.from(_starts);
    const _ends = getNodeEntries(editor, {
      match: matchCells,
      at: selection?.focus.path,
    });
    const [end] = Array.from(_ends);
    // Collapse selection if multiple cells are selected to avoid breaking the table
    if (!isCollapsed(selection) && (start || end) && start?.[0] !== end?.[0]) {
      const _cells = getNodeEntries(editor, { match: matchCells });
      const [cell] = Array.from(_cells);
      if (cell) {
        collapseSelection(editor, { edge: 'end' });
        insertText(text);
        return;
      }
    }
    insertText(text);
  };

  // prevent deleting cells with deleteBackward
  editor.deleteBackward = preventDeleteCell(
    deleteBackward,
    getStartPoint,
    getPointBefore
  );

  // prevent deleting cells with deleteForward
  editor.deleteForward = preventDeleteCell(
    deleteForward,
    getEndPoint,
    getPointAfter
  );

  return editor;
};
