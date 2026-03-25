/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { deleteTable } from './deleteTable';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteTable(editor);

    expect(editor.children).toMatchObject([
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteTable(editor);

    expect(editor.children).toMatchObject(input.children);
  });
});
