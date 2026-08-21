/** @jsx jsxt */

import assert from 'node:assert/strict';

import { NodeApi } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';

import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';
import type { TableRowElement } from './BaseTablePlugin';

describe('table merge', () => {
  describe('removeRow with expanded selections', () => {
    it('removes every row covered by a selected rowspan cell', () => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: true }),
        selection: {
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 2, path: [0, 0, 1, 0, 0] },
          kind: 'text',
        },
        initialValue: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { children: [{ text: '11' }], type: 'paragraph' },
                    ],
                    rowSpan: 2,
                    type: 'tableCell',
                  },
                  {
                    children: [
                      { children: [{ text: '12' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [
                      { children: [{ text: '22' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [
                      { children: [{ text: '31' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                  {
                    children: [
                      { children: [{ text: '32' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ],
      });

      editor.update.table.removeRow();

      const table = editor.read.nodes.get([0], { type: BaseTablePlugin });
      assert(table);

      expect(table[0].children).toHaveLength(1);
      expect(editor.read.text.string([0])).toBe('3132');
    });
  });

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('merged table range projection', () => {
      it('returns both cell entries and a table entry for format=all', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    11
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>
                    22
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const result = editor.plugin(BaseTablePlugin).read.getGridByRange({
          at: editor.read.selection()!,
          format: 'all',
        });

        expect(result.cellEntries).toHaveLength(4);
        expect(result.tableEntries).toHaveLength(1);
        expect(result.tableEntries[0]?.[1]).toEqual([0]);
        const table = result.tableEntries[0]?.[0];
        const firstRow = table?.children[0] as TableRowElement | undefined;

        expect(table?.children).toHaveLength(2);
        expect(firstRow?.children).toHaveLength(2);
      });

      it('returns only the cell entries for format=cell', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd colSpan={2}>
                  <hp>
                    <anchor />
                    11
                  </hp>
                </htd>
                <htd>
                  <hp>13</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>
                    22
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp>23</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const result = editor.plugin(BaseTablePlugin).read.getGridByRange({
          at: editor.read.selection()!,
          format: 'cell',
        });

        expect(result.map(([cell]) => NodeApi.string(cell))).toEqual([
          '11',
          '21',
          '22',
        ]);
      });

      it('reports whether the current table selection can merge or split', () => {
        const mergeInput = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    11
                  </hp>
                </htd>
                <htd>
                  <hp>
                    12
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const mergeEditor = createTableEditor(mergeInput);

        expect(mergeEditor.plugin(BaseTablePlugin).read.canMerge()).toBe(true);
        expect(mergeEditor.plugin(BaseTablePlugin).read.canSplit()).toBe(false);

        const splitInput = (
          <editor>
            <htable>
              <htr>
                <htd colSpan={2}>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;
        const splitEditor = createTableEditor(splitInput);

        expect(splitEditor.plugin(BaseTablePlugin).read.canMerge()).toBe(false);
        expect(splitEditor.plugin(BaseTablePlugin).read.canSplit()).toBe(true);
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('insertColumn with spans', () => {
      it('treats a table path as insert-at-end using the last cell of the first row', () => {
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

        editor.update.table.insertColumn({ at: [0], select: true });

        const entry = editor.read.nodes.get([0], { type: BaseTablePlugin });
        assert(entry);
        const [table] = entry;
        const rows = table.children as TableRowElement[];

        expect(rows[0].children).toHaveLength(3);
        expect(rows[1].children).toHaveLength(3);
      });

      it('extends spanning cells when inserting inside a merged span', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd colSpan={2}>
                  <hp>11</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
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

        editor.update.table.insertColumn({ at: [0, 0, 1] });

        expect(editor.read.children()).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    colSpan: 3,
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  { type: 'tableCell' },
                  { type: 'tableCell' },
                  { type: 'tableCell' },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ]);
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        initialValue: input.children,
      });

    describe('insertRow with spans', () => {
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

        editor.update.table.insertRow({ at: [0], select: true });

        const entry = editor.read.nodes.get([0], { type: BaseTablePlugin });
        assert(entry);
        expect(entry[0].children).toHaveLength(3);
      });

      it('extends row-spanning cells when inserting inside a merged span', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd rowSpan={2}>
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

        editor.update.table.insertRow({ at: [0, 1] });

        expect(editor.read.children()).toMatchObject([
          {
            children: [
              {
                children: [
                  {
                    rowSpan: 3,
                    type: 'tableCell',
                  },
                  { type: 'tableCell' },
                ],
                type: 'tableRow',
              },
              {
                children: [{ type: 'tableCell' }],
                type: 'tableRow',
              },
              {
                children: [{ type: 'tableCell' }],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ]);
      });
    });
  }
});
