/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { moveSelectionFromCell } from './moveSelectionFromCell';
import { setTableColSize } from './setTableColSize';
import { setTableRowSize } from './setTableRowSize';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('table sizing and selection helpers', () => {
  describe('setTableColSize', () => {
    it('creates a colSizes array when the table does not have one yet', () => {
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

      setTableColSize(editor, { colIndex: 1, width: 120 });

      expect(editor.children).toMatchObject([
        {
          colSizes: [0, 120],
          type: 'table',
        },
      ]);
    });

    it('updates only the requested column width when colSizes already exist', () => {
      const input = (
        <editor>
          <htable colSizes={[20, 30]}>
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

      setTableColSize(editor, { colIndex: 0, width: 64 });

      expect(editor.children).toMatchObject([
        {
          colSizes: [64, 30],
          type: 'table',
        },
      ]);
    });
  });

  describe('setTableRowSize', () => {
    it('sets the size on the requested table row', () => {
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

      setTableRowSize(editor, { height: 48, rowIndex: 0 });

      expect(editor.children).toMatchObject([
        {
          children: [{ size: 48 }, {}],
          type: 'table',
        },
      ]);
    });
  });

  describe('moveSelectionFromCell', () => {
    it('moves a collapsed selection to the next cell', () => {
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

      const output = (
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
              <htd>
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      moveSelectionFromCell(editor);

      expect(editor.selection).toEqual(output.selection);
    });

    it('expands the current cell range to the right edge', () => {
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
                <hp>
                  21
                  <focus />
                </hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
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
                  <focus />
                  22
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      moveSelectionFromCell(editor, { edge: 'right' });

      expect(editor.selection).toEqual(output.selection);
    });

    it('moves forward out of the table when there is no next cell', () => {
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

      const output = (
        <editor>
          <hp>before</hp>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
            </htr>
          </htable>
          <hp>
            <cursor />
            after
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      moveSelectionFromCell(editor);

      expect(editor.selection).toEqual(output.selection);
    });

    it('moves backward out of the table when there is no previous cell', () => {
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

      const output = (
        <editor>
          <hp>
            before
            <cursor />
          </hp>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
            </htr>
          </htable>
          <hp>after</hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      moveSelectionFromCell(editor, { reverse: true });

      expect(editor.selection).toEqual(output.selection);
    });

    it('handles ArrowDown through moveLine without relying on browser default movement', () => {
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
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
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
                  <cursor />
                  21
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTableEditor(input);

      expect(editor.tf.moveLine({ reverse: false })).toBe(true);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
