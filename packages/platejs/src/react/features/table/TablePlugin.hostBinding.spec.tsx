import { act, cleanup, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { createTestTableEditor } from '../../../features/table/lib/__tests__/getTestTablePlugins';
import {
  type EditorElementProps,
  EditorContent,
  EditorElement,
  EditorRoot,
} from '../../core';
import { TableCellPlugin, TablePlugin, TableRowPlugin } from './TablePlugin';

const HeaderContext = React.createContext(false);
let cellRenderCount = 0;

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
  cellRenderCount += 1;
  const header = React.useContext(HeaderContext);

  return (
    <EditorElement
      {...props}
      as={header ? 'th' : 'td'}
      attributes={{
        ...props.attributes,
        'data-test-table-cell': 'true',
      }}
    >
      {props.children}
    </EditorElement>
  );
}

afterEach(() => {
  cleanup();
  cellRenderCount = 0;
});

describe('TablePlugin selection host binding', () => {
  it('paints a contract-compliant custom cell across same-key host replacement and cleanup', async () => {
    const editor = createTestTableEditor({
      plugins: [
        TablePlugin.configure({ component: TestTableElement }),
        TableRowPlugin.configure({ component: TestTableRowElement }),
        TableCellPlugin.configure({ component: TestTableCellElement }),
      ],
      initialValue: [
        {
          children: [
            {
              children: ['one', 'two'].map((text) => ({
                children: [{ children: [{ text }], type: 'paragraph' }],
                type: 'tableCell',
              })),
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ],
    });
    const view = (header: boolean) => (
      <React.StrictMode>
        <HeaderContext value={header}>
          <EditorRoot editor={editor} suppressInstanceWarning>
            <EditorContent />
          </EditorRoot>
        </HeaderContext>
      </React.StrictMode>
    );
    const mounted = render(view(false));
    const initialCells = [
      ...mounted.container.querySelectorAll<HTMLElement>(
        'td[data-test-table-cell="true"]'
      ),
    ];
    const initialRenderCount = cellRenderCount;

    expect(initialCells).toHaveLength(2);

    act(() => {
      editor.update.selection.setNodes([
        [0, 0, 0],
        [0, 0, 1],
      ]);
    });

    await waitFor(() => {
      expect(
        mounted.container.querySelectorAll(
          'td[data-table-cell-selected="true"]'
        )
      ).toHaveLength(2);
    });
    expect(cellRenderCount).toBe(initialRenderCount);

    const initialSelection = editor.plugin(TablePlugin).read.selection();
    const initialAnchor = mounted.container.querySelector<HTMLElement>(
      `[data-editor-node-key="${initialSelection?.anchor}"]`
    );

    expect(initialAnchor?.style.caretColor).toBe('transparent');

    mounted.rerender(view(true));

    await waitFor(() => {
      expect(
        mounted.container.querySelectorAll(
          'th[data-table-cell-selected="true"]'
        )
      ).toHaveLength(2);
    });
    initialCells.forEach((cell) => {
      expect(cell.hasAttribute('data-table-cell-selected')).toBe(false);
      expect(cell.style.caretColor).toBe('');
    });

    const replacementCells = [
      ...mounted.container.querySelectorAll<HTMLElement>(
        'th[data-test-table-cell="true"]'
      ),
    ];
    const replacementAnchor = mounted.container.querySelector<HTMLElement>(
      `[data-editor-node-key="${initialSelection?.anchor}"]`
    );

    expect(replacementCells).toHaveLength(2);
    expect(replacementAnchor?.style.caretColor).toBe('transparent');

    mounted.unmount();
    replacementCells.forEach((cell) => {
      expect(cell.hasAttribute('data-table-cell-selected')).toBe(false);
      expect(cell.style.caretColor).toBe('');
    });
  });
});
