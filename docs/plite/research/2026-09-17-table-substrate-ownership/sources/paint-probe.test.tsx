import { expect, spyOn, test } from 'bun:test';
import { act, render } from '@testing-library/react';
import React from 'react';

import { createTestTableEditor } from '../../../../../packages/platejs/src/features/table/lib/__tests__/getTestTablePlugins';
import { EditorRoot } from '../../../../../packages/platejs/src/react/core';
import { TablePlugin } from '../../../../../packages/platejs/src/react/features/table/TablePlugin';
import { useTableSelectionDOM } from '../../../../../packages/platejs/src/react/features/table/useTableSelectionDOM';
import { EditableDOMRuntime } from '../../../../../packages/plitejs/src/react/editable/editable-dom-runtime';
import { EditableDOMRuntimeContext } from '../../../../../packages/plitejs/src/react/hooks/use-claim-editable-dom-commit';

test('selected anchor paint survives a same-key td-to-th React replacement', async () => {
  const editor = createTestTableEditor({
    plugins: [TablePlugin],
    initialValue: [{
      type: 'table',
      children: [{
        type: 'tableRow',
        children: ['one', 'two'].map((text) => ({
          type: 'tableCell',
          children: [{ type: 'paragraph', children: [{ text }] }],
        })),
      }],
    }],
    selection: {
      kind: 'node',
      anchorPath: [0, 0, 0],
      focusPath: [0, 0, 1],
      paths: [[0, 0, 0], [0, 0, 1]],
    },
  });
  const cellKeys = [editor.key([0, 0, 0])!, editor.key([0, 0, 1])!];
  const runtime = new EditableDOMRuntime({ editor });
  const claim = spyOn(runtime, 'claimReactCommit');
  const setRoot = (node: HTMLDivElement | null) => runtime.setRoot(node);
  const tableRef = React.createRef<HTMLTableElement>();
  const selectionState = () => {
    const view = editor.plugin(TablePlugin).read.selection()!;
    return {
      anchor: view.anchor,
      keys: view.cells.map(([, path]) => editor.key(path)),
    };
  };
  const readPaint = (cell: HTMLElement) => ({
    selected: cell.getAttribute('data-table-cell-selected'),
    caretColor: cell.style.caretColor,
  });
  const Table = ({ header }: { header: boolean }) => {
    useTableSelectionDOM(tableRef);
    return React.createElement('table', { ref: tableRef },
      React.createElement('tbody', null,
        React.createElement('tr', null,
          React.createElement(header ? 'th' : 'td', {
            key: cellKeys[0], 'data-editor-node-key': cellKeys[0],
          }, 'one'),
          React.createElement('td', {
            key: cellKeys[1], 'data-editor-node-key': cellKeys[1],
          }, 'two'))));
  };
  const tree = (header: boolean) => React.createElement(
    EditableDOMRuntimeContext.Provider, { value: runtime },
    React.createElement(EditorRoot, { editor, suppressInstanceWarning: true },
      React.createElement('div', { 'data-editor': true, ref: setRoot },
        React.createElement(Table, { header }))));

  runtime.connect();
  const mounted = render(tree(false));
  const table = tableRef.current!;
  const originalAnchor = table.querySelector<HTMLElement>('td')!;
  const survivingCell = table.querySelectorAll<HTMLElement>('td')[1]!;
  try {
    const beforeSelection = selectionState();
    expect(beforeSelection).toEqual({ anchor: cellKeys[0], keys: cellKeys });
    expect(readPaint(originalAnchor)).toEqual({
      selected: 'true', caretColor: 'transparent',
    });
    expect(readPaint(survivingCell)).toEqual({ selected: 'true', caretColor: '' });
    const beforeClaims = claim.mock.calls.length;

    mounted.rerender(tree(true));
    await act(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      runtime.domPhaseScheduler.flush();
    });

    const replacement = table.querySelector<HTMLElement>('th')!;
    expect(tableRef.current).toBe(table);
    expect(replacement).not.toBe(originalAnchor);
    expect(replacement.isConnected).toBe(true);
    expect(originalAnchor.isConnected).toBe(false);
    expect(replacement.getAttribute('data-editor-node-key')).toBe(cellKeys[0]);
    expect(selectionState()).toEqual(beforeSelection);
    expect(claim.mock.calls.length).toBeGreaterThan(beforeClaims);
    expect(readPaint(survivingCell)).toEqual({ selected: 'true', caretColor: '' });
    console.log('paint-probe replacement', JSON.stringify({
      beforeSelection,
      afterSelection: selectionState(),
      sameTable: tableRef.current === table,
      replacement: readPaint(replacement),
      survivingCell: readPaint(survivingCell),
      detachedOriginal: readPaint(originalAnchor),
      claimCallsBefore: beforeClaims,
      claimCallsAfter: claim.mock.calls.length,
    }));
    expect(readPaint(replacement)).toEqual({
      selected: 'true', caretColor: 'transparent',
    });
  } finally {
    mounted.unmount();
    console.log('paint-probe unmount observations', JSON.stringify({
      detachedOriginal: readPaint(originalAnchor),
      survivingCell: readPaint(survivingCell),
      note: 'Held DOM references after full React unmount; no live retained-table assertion.',
    }));
    runtime.destroy();
    claim.mockRestore();
  }
});
