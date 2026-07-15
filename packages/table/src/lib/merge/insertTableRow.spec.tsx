/** @jsx jsxt */

import assert from 'node:assert/strict';
import { createPlateEditor } from '@platejs/core/react';
import type { TTableElement } from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge: false }),
    selection: input.selection,
    value: input.children,
  });

describe('insertTableMergeRow', () => {
  it('treats a table path as insert-at-end using the last row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                21
                <cursor />
              </hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.insert.tableRow({ at: [0], select: true });

    const entry = editor.read.nodes.get<TTableElement>([0]);
    assert(entry);
    expect(entry[0].children).toHaveLength(3);
  });

  it('extends row-spanning cells and updates rowspan attributes when inserting inside a merged span', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd attributes={{ rowspan: '2' }} rowSpan={2}>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                22
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.insert.tableRow({ at: [0, 1] });

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          {
            children: [
              {
                attributes: { rowspan: '3' },
                rowSpan: 3,
                type: 'td',
              },
              { type: 'td' },
            ],
            type: 'tr',
          },
          {
            children: [{ colSpan: 1, rowSpan: 1, type: 'td' }],
            type: 'tr',
          },
          {
            children: [{ type: 'td' }],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);
  });
});
