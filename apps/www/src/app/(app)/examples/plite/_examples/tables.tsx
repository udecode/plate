import {
  defineEditorExtension,
  editorCommands,
  NodeApi,
  PointApi,
  RangeApi,
} from '@platejs/plite';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  Plite,
  usePliteEditor,
} from '@platejs/plite-react';
import type { CustomEditor, CustomValue } from './custom-types.d';

const initialValue: CustomValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
      },
    ],
  },
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '' }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Human', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Dog', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: 'Cat', bold: true }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '# of Feet', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: '2' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4' }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '# of Lives', bold: true }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1' }],
          },
          {
            type: 'table-cell',
            children: [{ text: '9' }],
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'This table is a basic rendering example with conservative cell-boundary editing. Backspace, Delete, Enter, and arrow movement stay inside valid table or text positions; richer table features such as headers, row and column controls, formulas, and multi-cell selection belong in table extensions.',
      },
    ],
  },
];

const TablesExample = () => {
  const editor = usePliteEditor({
    extensions: [table()],
    initialValue,
  });
  const moveSelectionToAdjacentCell = (reverse: boolean) => {
    let moved = false;

    editor.update((tx) => {
      const cell = tx.nodes.find({
        match: (n) => NodeApi.isElement(n) && n.type === 'table-cell',
      });

      if (!cell) {
        return;
      }

      const [, cellPath] = cell;
      const cellIndex = cellPath.at(-1)!;
      const rowIndex = cellPath.at(-2)!;
      const rowPath = cellPath.slice(0, -1);
      const tablePath = cellPath.slice(0, -2);
      let targetPath: number[] | null = null;

      if (reverse) {
        const previousCellPath = [...rowPath, cellIndex - 1];

        if (cellIndex > 0 && tx.nodes.hasPath(previousCellPath)) {
          targetPath = previousCellPath;
        } else if (rowIndex > 0) {
          const previousRowPath = [...tablePath, rowIndex - 1];

          const previousRow = tx.nodes.get(previousRowPath)?.[0];

          if (previousRow && NodeApi.isElement(previousRow)) {
            targetPath = [...previousRowPath, previousRow.children.length - 1];
          }
        }
      } else {
        const nextCellPath = [...rowPath, cellIndex + 1];

        if (tx.nodes.hasPath(nextCellPath)) {
          targetPath = nextCellPath;
        } else {
          const nextRowPath = [...tablePath, rowIndex + 1];

          if (tx.nodes.hasPath(nextRowPath)) {
            targetPath = [...nextRowPath, 0];
          }
        }
      }

      if (targetPath) {
        const point = tx.points.start(targetPath);

        if (point) {
          tx.selection.set(point);
          moved = true;
        }
      }
    });

    if (moved) {
      editor.api.dom.focus();
    }

    return moved;
  };

  return (
    <Plite editor={editor}>
      <Editable
        onKeyDown={(event) => {
          if (event.key !== 'Tab') {
            return;
          }

          if (moveSelectionToAdjacentCell(event.shiftKey)) {
            event.preventDefault();
          }
        }}
        renderElement={Element}
        renderLeaf={Leaf}
      />
    </Plite>
  );
};

const table = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'table',
    commands: ({ handle }) => [
      handle(editorCommands.delete, ({ input, state }) => {
        const selection = state.selection();

        if (selection && RangeApi.isCollapsed(selection)) {
          const cell = state.nodes.find({
            match: (n) => NodeApi.isElement(n) && n.type === 'table-cell',
          });

          if (cell) {
            const [, cellPath] = cell;
            const edge =
              input.direction === 'backward'
                ? state.points.start(cellPath)
                : state.points.end(cellPath);

            if (edge && PointApi.equals(selection.anchor, edge)) {
              return state.transaction(() => {});
            }
          }
        }

        return false;
      }),
      handle(editorCommands.insertBreak, ({ state }) => {
        const selection = state.selection();

        if (selection && RangeApi.isCollapsed(selection)) {
          const cell = state.nodes.find({
            match: (n) => NodeApi.isElement(n) && n.type === 'table-cell',
          });

          if (cell) {
            return state.transaction(() => {});
          }
        }

        return false;
      }),
    ],
  });

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'table':
      return (
        <table className="plite-tables-table">
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

export default TablesExample;
