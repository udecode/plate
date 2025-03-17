/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { getTestTablePlugins } from '../withNormalizeTable.spec';
import { insertTable } from './insertTable';

jsxt;

describe('insertTable', () => {
  describe('when inserting a table', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should insert a table at current selection (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      }
    );

    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should insert a table at specified path (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
      }
    );

    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should insert a table after current table when no path specified (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      }
    );

    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should respect specified path even when inside a table (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
      }
    );

    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should insert a table after current table when inside a table (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        insertTable(editor, { colCount: 2, rowCount: 2 }, { select: true });

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      }
    );
  });
});
