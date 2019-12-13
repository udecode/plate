import React from 'react';
import { Editor, Point, Range } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { Plugin, RenderElementProps, RenderLeafProps } from 'slate-react';

export const withTable = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    const { selection } = editor;
    const { type } = command;

    if (
      (type === 'delete_forward' || type === 'delete_backward') &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const [cell] = Editor.nodes(editor, {
        match: { type: ElementType.TABLE_CELL },
      });

      if (cell) {
        const [, cellPath] = cell;
        const edge =
          type === 'delete_backward'
            ? Editor.start(editor, cellPath)
            : Editor.end(editor, cellPath);

        if (Point.equals(selection.anchor, edge)) {
          return;
        }
      }
    }

    if (type === 'insert_break' && selection) {
      const [table] = Editor.nodes(editor, {
        match: { type: ElementType.TABLE },
      });

      if (table) {
        return;
      }
    }

    exec(command);
  };

  return editor;
};

export const renderElementTable = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case ElementType.TABLE:
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case ElementType.TABLE_ROW:
      return <tr {...attributes}>{children}</tr>;
    case ElementType.TABLE_CELL:
      return <td {...attributes}>{children}</td>;
    default:
      break;
  }
};

export const renderLeafTable = ({ children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  return children;
};

export const TablePlugin = (): Plugin => ({
  editor: withTable,
  renderElement: renderElementTable,
  renderLeaf: renderLeafTable,
});
