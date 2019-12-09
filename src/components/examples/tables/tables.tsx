import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Editor, Point, Range } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from 'slate-react';
import { initialValue } from './config';

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'table':
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case 'table-row':
      return <tr {...attributes}>{children}</tr>;
    case 'table-cell':
      return <td {...attributes}>{children}</td>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  return <span {...attributes}>{children}</span>;
};

const withTables = (editor: Editor) => {
  const { exec } = editor;

  editor.exec = command => {
    const { selection } = editor;
    const { type } = command;

    if (
      (type === 'delete_forward' || type === 'delete_backward') &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const [cell] = Editor.nodes(editor, { match: { type: 'table-cell' } });

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
      const [table] = Editor.nodes(editor, { match: { type: 'table' } });

      if (table) {
        return;
      }
    }

    exec(command);
  };

  return editor;
};

export const Tables = () => {
  const [value, setValue] = useState(initialValue);
  const [selection, setSelection] = useState<Range | null>(null);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  const editor = useMemo(
    () => withTables(withHistory(withReact(createEditor()))),
    []
  );
  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
      }}
    >
      <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  );
};
