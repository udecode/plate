/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    initialValue: input.children,
  });

describe('deleteTable', () => {
  it('removes the current table and keeps surrounding blocks', () => {
    const input = (
      <editor>
        <hp>before</hp>
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
        <hp>after</hp>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.remove.table();

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'before' }], type: 'p' },
      { children: [{ text: 'after' }], type: 'p' },
    ]);
  });

  it('does nothing when the selection is outside a table', () => {
    const input = (
      <editor>
        <hp>
          text
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.remove.table();

    expect(editor.read.children()).toMatchObject(input.children);
  });
});
