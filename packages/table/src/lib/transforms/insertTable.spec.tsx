/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { insertTable } from './insertTable';

jsxt;

describe('insertTable', () => {
  describe('when inserting a table', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts a table at the current selection (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp>test</hp>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts a table at the specified path (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <hp>test</hp>
          <hp>
            another
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
          <hp>test</hp>
          <hp>another</hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      insertTable(
        editor,
        { colCount: 2, rowCount: 2 },
        { at: [0], select: true }
      );

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts a table after the current table when no path is specified (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  existing
                  <cursor />
                </hp>
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
                <hp>existing</hp>
              </htd>
            </htr>
          </htable>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('respects the specified path even when inside a table (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <hp>before</hp>
          <htable>
            <htr>
              <htd>
                <hp>
                  existing
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
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
          <htable>
            <htr>
              <htd>
                <hp>existing</hp>
              </htd>
            </htr>
          </htable>
          <hp>after</hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      insertTable(
        editor,
        { colCount: 2, rowCount: 2 },
        { at: [1], select: true }
      );

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts a table after the current table when inside a table (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  existing
                  <cursor />
                </hp>
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
                <hp>existing</hp>
              </htd>
            </htr>
          </htable>
          <htable>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

      expect(editor.children).toMatchObject(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
