import React, { useCallback, useMemo } from 'react';
import { createEditor, Editor, Point, Range } from 'slate';
import { withHistory } from 'slate-history';
import { RenderElementProps, RenderMarkProps, withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
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

const Mark = ({ attributes, children, mark }: RenderMarkProps) => {
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{children}</strong>;
    default:
      return <span {...attributes}>{children}</span>;
  }
};

export const Tables = () => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderMark = useCallback(props => <Mark {...props} />, []);

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

  const editor = useMemo(
    () => withTables(withHistory(withReact(createEditor()))),
    []
  );
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable renderElement={renderElement} renderMark={renderMark} />
    </Slate>
  );
};
