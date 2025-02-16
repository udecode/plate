/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { getTestTablePlugins } from '../withNormalizeTable.spec';
import { insertTableRow } from './insertTableRow';

jsxt;

describe('insertTableRow', () => {
  describe('when inserting a table row', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should insert a tr with empty cells (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
                  <hp>22</hp>
                </htd>
              </htr>
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
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        insertTableRow(editor, { select: true });

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      }
    );
  });

  describe('when inserting a table row at specific path', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should insert a tr with empty cells (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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

        const editor = createPlateEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        insertTableRow(editor, { at: [0, 0], select: true });

        expect(editor.children).toMatchObject(output.children);
        expect(editor.selection).toEqual(output.selection);
      }
    );
  });

  describe('when inserting a table row before', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should insert a tr with empty cells before the current row (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
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
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
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

        insertTableRow(editor, { before: true, select: true });

        expect(editor.children).toMatchObject(output.children);
      }
    );
  });
});
