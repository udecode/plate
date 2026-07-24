/** @jsx jsxt */

import assert from 'node:assert/strict';

import { createPlateEditor, type PlateEditor } from '@platejs/core/react';
import { NodeApi } from '@platejs/plite';
import type { Element, Value } from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import type { TTableElement } from '@platejs/utils';
import { BaseYjsPlugin } from '@platejs/yjs';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';
import { compileTableGrid } from './internal/grid';

jsxt;

const tableText = (editor: PlateEditor<any, any>) => {
  const table = editor.read.children()[0] as TTableElement;
  const grid = compileTableGrid(table);

  return grid.slots.map((row) =>
    row.map((anchor) => (anchor ? NodeApi.string(anchor.cell) : ''))
  );
};

const createTarget = () => {
  const input = (
    <editor>
      <htable>
        <htr>
          <htd>
            <hp>
              <anchor />a
            </hp>
          </htd>
          <htd>
            <hp>b</hp>
          </htd>
        </htr>
        <htr>
          <htd>
            <hp>c</hp>
          </htd>
          <htd>
            <hp>
              d<focus />
            </hp>
          </htd>
        </htr>
      </htable>
    </editor>
  ) as TestEditor;

  return createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    initialValue: input.children,
  });
};

describe('BaseTablePlugin prepared paste', () => {
  it('publishes one history entry with stable undo and redo', () => {
    const editor = createTarget();
    const before = editor.read.value();
    const source = (
      <fragment>
        <htable>
          <htr>
            <htd>
              <hp>x</hp>
            </htd>
            <htd>
              <hp>y</hp>
            </htd>
          </htr>
        </htable>
      </fragment>
    ) as Element[];

    expect(editor.read.history.undos()).toHaveLength(0);
    expect(editor.update.fragment.replace(source)).toBe(true);
    expect(editor.read.history.undos()).toHaveLength(1);
    expect(tableText(editor)).toEqual([
      ['x', 'y'],
      ['x', 'y'],
    ]);

    editor.update.history.undo();
    expect(editor.read.value()).toEqual(before);

    editor.update.history.redo();
    expect(tableText(editor)).toEqual([
      ['x', 'y'],
      ['x', 'y'],
    ]);
    expect(editor.read.history.undos()).toHaveLength(1);
  });

  it('gives an exact model slice precedence over conflicting HTML and text', () => {
    const sourceInput = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                exact-a
              </hp>
            </htd>
            <htd>
              <hp>
                exact-b
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const source = createPlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins(),
      selection: sourceInput.selection,
      initialValue: sourceInput.children,
    });
    const target = createTarget();
    const data = new DataTransfer();

    expect(source.plugin(BaseTablePlugin).api.writeSelection(data)).toBe(true);
    data.setData(
      'text/html',
      '<table><tbody><tr><td>html-a</td><td>html-b</td></tr></tbody></table>'
    );
    data.setData('text/plain', 'plain-a\tplain-b');

    const commits: unknown[] = [];
    const unsubscribe = target.subscribeCommit((commit) =>
      commits.push(commit)
    );

    expect(target.api.clipboard.insertData(data)).toBe(true);
    unsubscribe();

    expect(tableText(target)).toEqual([
      ['exact-a', 'exact-b'],
      ['exact-a', 'exact-b'],
    ]);
    expect(commits).toHaveLength(1);
  });

  it.each([
    'embedded metadata',
    'fragment MIME',
  ] as const)('consumes corrupt exact %s without using valid fallback payloads', (format) => {
    const editor = createTarget();
    const before = editor.read.value();
    const data = new DataTransfer();

    if (format === 'fragment MIME') {
      data.setData('application/x-plite-fragment', 'not-valid-base64');
      data.setData(
        'text/html',
        '<table><tbody><tr><td>html fallback</td></tr></tbody></table>'
      );
    } else {
      data.setData(
        'text/html',
        '<table data-plite-fragment="not-valid-base64" data-plite-fragment-format="x-plite-fragment"><tbody><tr><td>html fallback</td></tr></tbody></table>'
      );
    }
    data.setData('text/plain', 'plain fallback');

    const commits: unknown[] = [];
    const unsubscribe = editor.subscribeCommit((commit) =>
      commits.push(commit)
    );

    expect(
      editor.plugin(BaseTablePlugin).api.getSelection()?.anchors.length
    ).toBeGreaterThan(1);
    expect(editor.api.clipboard.insertData(data)).toBe(true);
    unsubscribe();

    expect(editor.read.value()).toEqual(before);
    expect(editor.read.history.undos()).toHaveLength(0);
    expect(commits).toHaveLength(0);
  });

  it('keeps generic plain-text fallback for corrupt exact data at a caret', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />a
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createPlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins(),
      selection: input.selection,
      initialValue: input.children,
    });
    const data = new DataTransfer();

    data.setData('application/x-plite-fragment', 'not-valid-base64');
    data.setData('text/plain', 'plain fallback');

    expect(
      editor.plugin(BaseTablePlugin).api.getSelection()?.anchors.length
    ).toBe(1);
    expect(editor.api.clipboard.insertData(data)).toBe(true);
    expect(tableText(editor)).toEqual([['plain fallbacka']]);
    expect(editor.read.history.undos()).toHaveLength(1);
  });

  it('consumes a recognized invalid table without partial publication', () => {
    const editor = createTarget();
    const before = editor.read.value();
    const commits: unknown[] = [];
    const unsubscribe = editor.subscribeCommit((commit) =>
      commits.push(commit)
    );

    expect(
      editor.update.fragment.replace([
        { children: [], type: 'table' },
      ] as Element[])
    ).toBe(true);
    unsubscribe();

    expect(editor.read.value()).toEqual(before);
    expect(editor.read.history.undos()).toHaveLength(0);
    expect(commits).toHaveLength(0);
  });

  it('publishes one canonical Yjs update and exact replay', () => {
    const initialValue: Value = [
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'a' }], type: 'p' }],
                id: 'a',
                type: 'td',
              },
              {
                children: [{ children: [{ text: 'b' }], type: 'p' }],
                id: 'b',
                type: 'td',
              },
            ],
            id: 'row',
            type: 'tr',
          },
        ],
        id: 'table',
        type: 'table',
      },
    ];
    const selection = {
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0, 0] },
      kind: 'text' as const,
    };
    const source = createPlateEditor({
      nodeId: true,
      plugins: [
        BaseTablePlugin,
        BaseYjsPlugin.configure({ options: { clientId: 'source' } }),
      ],
      selection,
      initialValue,
    });
    const doc = source.read((state) => state.yjs.doc());
    const replay = createPlateEditor({
      nodeId: true,
      plugins: [
        BaseTablePlugin,
        BaseYjsPlugin.configure({
          options: { clientId: 'replay', doc },
        }),
      ],
      initialValue: [{ children: [{ text: 'local' }], type: 'p' }],
    });
    const pasted = (
      <fragment>
        <htable>
          <htr>
            <htd>
              <hp>x</hp>
            </htd>
            <htd>
              <hp>y</hp>
            </htd>
          </htr>
        </htable>
      </fragment>
    ) as Element[];
    let updateCount = 0;

    doc.on('update', () => updateCount++);
    expect(source.update.fragment.replace(pasted)).toBe(true);

    expect(updateCount).toBe(1);
    assert.deepEqual(replay.read.children(), source.read.children());
    expect(tableText(source)).toEqual([['x', 'y']]);
  });
});
