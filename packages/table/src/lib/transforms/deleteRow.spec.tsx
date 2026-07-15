/** @jsx jsxt */

import assert from 'node:assert/strict';
import { createPlateEditor } from '@platejs/core/react';
import type { TTableElement } from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';

jsxt;

const createTableEditor = (
  input: TestEditor,
  { disableMerge = true }: { disableMerge?: boolean } = {}
) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge }),
    selection: input.selection,
    value: input.children,
  });

describe('deleteRow', () => {
  it('deletes a fully selected row', () => {
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
              <hp>
                12
                <focus />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.remove.tableRow();

    expect(editor.read.text.string([0])).toBe('2122');
    expect(editor.read.nodes.toArray({ match: { type: 'tr' } })).toHaveLength(
      1
    );
  });

  it('removes the current row when the table has more than one row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                21
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.remove.tableRow();

    const entry = editor.read.nodes.get<TTableElement>([0]);
    assert(entry);
    expect(entry[0].children).toHaveLength(1);
    expect(editor.read.text.string([0, 0, 0])).toBe('11');
  });

  it('keeps the last remaining row intact', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.remove.tableRow();

    expect(editor.read.children()).toMatchObject(input.children);
  });
});
