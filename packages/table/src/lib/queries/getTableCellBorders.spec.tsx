/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { getTableCellBorders } from './getTableCellBorders';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    value: input.children,
  });

describe('getTableCellBorders', () => {
  it('falls back to bottom and right defaults when the cell has no row parent', () => {
    const input = (
      <editor>
        <htd>
          <hp>orphan</hp>
        </htd>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const element = editor.children[0] as any;

    expect(
      getTableCellBorders(editor, {
        defaultBorder: { color: 'gray', size: 2, style: 'solid' },
        element,
      })
    ).toEqual({
      bottom: { color: 'gray', size: 2, style: 'solid' },
      right: { color: 'gray', size: 2, style: 'solid' },
    });
  });

  it('falls back to bottom and right defaults when the row has no table parent', () => {
    const input = (
      <editor>
        <htr>
          <htd>
            <hp>orphan</hp>
          </htd>
        </htr>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const element = (editor.children[0] as any).children[0] as any;

    expect(
      getTableCellBorders(editor, {
        defaultBorder: { color: 'gray', size: 2, style: 'solid' },
        element,
      })
    ).toEqual({
      bottom: { color: 'gray', size: 2, style: 'solid' },
      right: { color: 'gray', size: 2, style: 'solid' },
    });
  });

  it('returns top and left borders only for the first row and first column', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd
              borders={{
                bottom: { color: 'red', size: 4 },
                top: { style: 'dashed' },
              }}
            >
              <hp>11</hp>
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
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const element = ((editor.children[0] as any).children[0] as any)
      .children[0];

    expect(
      getTableCellBorders(editor, {
        defaultBorder: { color: 'gray', size: 1, style: 'solid' },
        element,
      })
    ).toEqual({
      bottom: { color: 'red', size: 4, style: 'solid' },
      left: { color: 'gray', size: 1, style: 'solid' },
      right: { color: 'gray', size: 1, style: 'solid' },
      top: { color: 'gray', size: 1, style: 'dashed' },
    });
  });

  it('omits top and left borders for non-edge cells', () => {
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
              <hp>21</hp>
            </htd>
            <htd borders={{ right: { size: 3 } }}>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const element = ((editor.children[0] as any).children[1] as any)
      .children[1];

    expect(
      getTableCellBorders(editor, {
        defaultBorder: { size: 1 },
        element,
      })
    ).toEqual({
      bottom: { color: undefined, size: 1, style: undefined },
      left: undefined,
      right: { color: undefined, size: 3, style: undefined },
      top: undefined,
    });
  });
});
