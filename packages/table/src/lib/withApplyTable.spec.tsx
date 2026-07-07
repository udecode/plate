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

describe('withApplyTable', () => {
  it('clamps selection focus to the end of the table when dragging from inside the table to a block after it', () => {
    const input = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>cell</hp>
            </htd>
          </htr>
        </htable>
        <hp>
          <cursor />
          after
        </hp>
      </editor>
    ) as any as SlateEditor;

    const requested = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                cell
              </hp>
            </htd>
          </htr>
        </htable>
        <hp>
          <focus />
          after
        </hp>
      </editor>
    ) as any as SlateEditor;

    const expected = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                cell
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
        <hp>after</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    editor.tf.select(requested.selection!);

    expect(editor.selection).toEqual(expected.selection);
  });

  it('clamps backward selection focus to the point before the table when dragging from a block after it into the table', () => {
    const input = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>cell</hp>
            </htd>
          </htr>
        </htable>
        <hp>
          after
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const requested = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>
                <focus />
                cell
              </hp>
            </htd>
          </htr>
        </htable>
        <hp>
          after
          <anchor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const expected = (
      <editor>
        <hp>
          before
          <focus />
        </hp>
        <htable>
          <htr>
            <htd>
              <hp>cell</hp>
            </htd>
          </htr>
        </htable>
        <hp>
          after
          <anchor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    editor.tf.select(requested.selection!);

    expect(editor.selection).toEqual(expected.selection);
  });
});
