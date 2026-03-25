/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('withTable', () => {
  it('selectAll selects the whole table when the cursor is inside it', () => {
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const tableRange = editor.api.range([0]);

    expect(editor.tf.selectAll()).toBe(true);
    if (!tableRange) throw new Error('Expected table range');
    expect(editor.selection).toEqual(tableRange);
  });

  it('collapses a multi-cell selection before tabbing', () => {
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
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(editor.api.isCollapsed()).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0, 1, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
    });
  });

  it('tabs forward to the next cell', () => {
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
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
    });
  });

  it('shift-tabs back to the previous cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>
                12
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0, 0, 0] },
    });
  });
});
