import { act, cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { NodeApi } from '../../../core';
import { createTestTableEditor } from '../../../features/table/lib/__tests__/getTestTablePlugins';
import type { TableElement } from '../../../features/table/lib/BaseTablePlugin';
import {
  type EditorElementProps,
  EditorContent,
  EditorElement,
  EditorRoot,
} from '../../core';
import { TableCellPlugin, TablePlugin, TableRowPlugin } from './TablePlugin';

function TestTableElement(props: EditorElementProps<typeof TablePlugin>) {
  return (
    <EditorElement {...props}>
      <table>
        <tbody>{props.children}</tbody>
      </table>
    </EditorElement>
  );
}

function TestTableRowElement(props: EditorElementProps<typeof TableRowPlugin>) {
  return (
    <EditorElement {...props} as="tr">
      {props.children}
    </EditorElement>
  );
}

function TestTableCellElement(
  props: EditorElementProps<typeof TableCellPlugin>
) {
  return (
    <EditorElement {...props} as="td">
      {props.children}
    </EditorElement>
  );
}

const cell = (...lines: string[]) => ({
  children: lines.map((text) => ({ children: [{ text }], type: 'paragraph' })),
  type: 'tableCell',
});

const mountTable = (
  rows: Array<
    Array<ReturnType<typeof cell> & { colSpan?: number; rowSpan?: number }>
  >
) => {
  const editor = createTestTableEditor({
    plugins: [
      TablePlugin.configure({ component: TestTableElement }),
      TableRowPlugin.configure({ component: TestTableRowElement }),
      TableCellPlugin.configure({ component: TestTableCellElement }),
    ],
    initialValue: [
      {
        children: rows.map((children) => ({ children, type: 'tableRow' })),
        type: 'table',
      },
    ],
  });
  const results: unknown[] = [];
  const mounted = render(
    <EditorRoot editor={editor} suppressInstanceWarning>
      <EditorContent onPasteResult={(result) => results.push(result)} />
    </EditorRoot>
  );
  const editable = mounted.getByRole('textbox');

  Object.defineProperty(editable, 'isContentEditable', {
    configurable: true,
    value: true,
  });
  act(() => {
    editor.update.selection.setNodes(
      rows.flatMap((row, rowIndex) =>
        row.map((_, column) => [0, rowIndex, column])
      )
    );
  });

  return { editable, editor, results };
};

const cellTexts = (editor: ReturnType<typeof mountTable>['editor']) =>
  (editor.read.children()[0] as TableElement).children.flatMap((row) =>
    row.children.map((tableCell) => NodeApi.string(tableCell))
  );

afterEach(() => {
  cleanup();
});

describe('TablePlugin clipboard', () => {
  it('copies selected cells as tab-separated text only', () => {
    const { editable } = mountTable([
      [cell('a', 'b'), cell('"q'), cell('x\ty'), cell('6"')],
    ]);
    const data = new DataTransfer();

    act(() => {
      fireEvent.copy(editable, { clipboardData: data });
    });

    expect({
      csv: data.getData('text/csv'),
      plain: data.getData('text/plain'),
    }).toEqual({ csv: '', plain: '"a\nb"\t"""q"\t"x\ty"\t6"\n' });
  });

  it('copies an empty field for each slot a merged cell spans', () => {
    const { editable } = mountTable([
      [
        { ...cell('X'), rowSpan: 2 },
        { ...cell('A'), colSpan: 2 },
      ],
      [cell('B'), cell('C')],
    ]);
    const data = new DataTransfer();

    act(() => {
      fireEvent.copy(editable, { clipboardData: data });
    });

    expect(data.getData('text/plain')).toBe('X\tA\t\n\tB\tC\n');
  });

  it('cuts every selected cell of a table with a row-spanned column', () => {
    const { editable, editor } = mountTable([
      [cell('a'), cell('b'), { ...cell('c'), rowSpan: 2 }],
      [cell('d'), cell('e')],
    ]);
    const data = new DataTransfer();

    act(() => {
      fireEvent.cut(editable, { clipboardData: data });
    });

    expect({
      cells: cellTexts(editor),
      plain: data.getData('text/plain'),
    }).toEqual({
      cells: ['', '', '', '', ''],
      plain: 'a\tb\tc\nd\te\t\n',
    });
  });

  it('refuses to cut a node selection of diagonal cells', () => {
    const { editable, editor } = mountTable([
      [cell('a'), cell('b')],
      [cell('c'), cell('d')],
    ]);
    const data = new DataTransfer();

    act(() => {
      editor.update.selection.setNodes([
        [0, 0, 0],
        [0, 1, 1],
      ]);
    });
    act(() => {
      fireEvent.cut(editable, { clipboardData: data });
    });

    expect({
      cells: cellTexts(editor),
      plain: data.getData('text/plain'),
    }).toEqual({ cells: ['a', 'b', 'c', 'd'], plain: '' });
  });

  it('reports the fields a paste leaves outside the selected cells', async () => {
    const { editable, results } = mountTable([
      [cell('a'), cell('b')],
      [cell('c'), cell('d')],
    ]);
    const data = new DataTransfer();

    data.setData('text/plain', '1\t2\t3\n4\t5\t6\n7\t8\t9\n');
    let pasteNotCanceled = true;

    await act(async () => {
      pasteNotCanceled = fireEvent.paste(editable, { clipboardData: data });
    });
    if (pasteNotCanceled) {
      const beforeInput = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertFromPaste',
      });

      Object.defineProperty(beforeInput, 'dataTransfer', { value: data });
      await act(async () => {
        editable.dispatchEvent(beforeInput);
      });
    }

    expect(results).toEqual([
      {
        diagnostics: [
          {
            impact: 'lossy',
            message:
              'Left out 5 pasted fields that do not fit the selected cells.',
          },
        ],
        inserted: true,
      },
    ]);
  });
});
