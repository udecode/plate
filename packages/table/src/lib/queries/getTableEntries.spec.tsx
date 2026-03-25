/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableEntries } from './getTableEntries';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('getTableEntries', () => {
  it('returns the cell, row, and table entries for the current table selection', () => {
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const entries = getTableEntries(editor)!;

    expect(entries.cell[0].type).toBe('td');
    expect(entries.cell[1]).toEqual([0, 1, 0]);
    expect(entries.row[0].type).toBe('tr');
    expect(entries.row[1]).toEqual([0, 1]);
    expect(entries.table[0].type).toBe('table');
    expect(entries.table[1]).toEqual([0]);
  });

  it('supports an explicit location even when the current selection is outside the table', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
        </htable>
        <hp>
          after
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const entries = getTableEntries(editor, {
      at: { offset: 0, path: [0, 0, 0, 0, 0] },
    })!;

    expect(entries.cell[1]).toEqual([0, 0, 0]);
    expect(entries.row[1]).toEqual([0, 0]);
    expect(entries.table[1]).toEqual([0]);
  });

  it('returns undefined when the location is not inside a table cell', () => {
    const input = (
      <editor>
        <hp>
          text
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(getTableEntries(editor)).toBeUndefined();
    expect(getTableEntries(editor, { at: null })).toBeUndefined();
  });
});
