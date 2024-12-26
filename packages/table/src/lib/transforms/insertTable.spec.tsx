/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { insertTable } from './insertTable';

jsxt;

const tablePlugin = BaseTablePlugin.configure({
  options: { disableMerge: true },
});

describe('insertTable', () => {
  describe('when inserting a table', () => {
    it('should insert a table at current selection', () => {
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

      const editor = createPlateEditor({
        editor: input,
        plugins: [tablePlugin],
      });

      insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should insert a table at specified path', () => {
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

      const editor = createPlateEditor({
        editor: input,
        plugins: [tablePlugin],
      });

      insertTable(
        editor,
        { colCount: 2, rowCount: 2 },
        { at: [0], select: true }
      );

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should insert a table after current table when no path specified', () => {
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

      const editor = createPlateEditor({
        editor: input,
        plugins: [tablePlugin],
      });

      insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should respect specified path even when inside a table', () => {
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

      const editor = createPlateEditor({
        editor: input,
        plugins: [tablePlugin],
      });

      insertTable(
        editor,
        { colCount: 2, rowCount: 2 },
        { at: [1], select: true }
      );

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should insert a table after current table when inside a table', () => {
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

      const editor = createPlateEditor({
        editor: input,
        plugins: [tablePlugin],
      });

      insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
