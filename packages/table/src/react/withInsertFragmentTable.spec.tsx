/** @jsx jsxt */

import {
  type SlateEditor,
  type TElement,
  createSlateEditor,
} from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { TablePlugin } from './TablePlugin';

jsxt;

describe('withInsertFragmentTable', () => {
  // https://github.com/udecode/editor-protocol/issues/13
  describe('when inserting table 2x1 into cell 11', () => {
    it('first table column should be replaced by the inserted table column', () => {
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

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as TElement[];

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>b</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        editor: input,
        plugins: [TablePlugin],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/14
  describe('when inserting table 1x2 into cell 11', () => {
    it('first table row should be replaced by the inserted table row', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <cursor />
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

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as TElement[];

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>b</hp>
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

      const editor = createSlateEditor({
        editor: input,
        plugins: [TablePlugin],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/24
  describe('Insert a table when selecting table cells', () => {
    it('replace these cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <anchor />
                11
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
                22
                <focus />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as TElement[];

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>b</hp>
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
        editor: input,
        plugins: [TablePlugin],
      });

      editor.deleteFragment();
      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/20
  describe('when inserting table 2x1 into cell 12', () => {
    it('second table column should be replaced by the inserted table column', () => {
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

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as TElement[];

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>
                  <anchor />a
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>
                  b<focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        editor: input,
        plugins: [TablePlugin],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);

      expect(editor.selection).toEqual(output.selection);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/32
  describe('when insert table 2x2 into cell 22', () => {
    it('should expand the table', () => {
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

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>aa</hp>
              </htd>
              <htd>
                <hp>ab</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>ba</hp>
              </htd>
              <htd>
                <hp>bb</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as TElement[];

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
              <htd custom>
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
                <hp>
                  <anchor />
                  aa
                </hp>
              </htd>
              <htd custom>
                <hp>ab</hp>
              </htd>
            </htr>
            <htr>
              <htd custom>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd custom>
                <hp>ba</hp>
              </htd>
              <htd custom>
                <hp>
                  bb
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          TablePlugin.extendEditorApi(() => ({
            create: {
              cell: () => ({
                children: [{ text: '' }],
                custom: true,
                type: 'td',
              }),
            },
          })),
        ],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('when insert table 2x2 into cell 22 with disableExpandOnInsert', () => {
    it('should not expand the table', () => {
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

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>aa</hp>
              </htd>
              <htd>
                <hp>ab</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>ba</hp>
              </htd>
              <htd>
                <hp>bb</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as TElement[];

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
                  <anchor />
                  aa
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          TablePlugin.configure({
            options: {
              disableExpandOnInsert: true,
            },
          }),
        ],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);

      expect(editor.selection).toEqual(output.selection);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/63
  describe('when inserting table cells with multiple p', () => {
    it('should paste', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11a</hp>
                <hp>
                  11b
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

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>o11a</hp>
                <hp>o11b</hp>
              </htd>
              <htd>
                <hp>o12</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as TElement[];

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>o11a</hp>
                <hp>o11b</hp>
              </htd>
              <htd>
                <hp>o12</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        editor: input,
        plugins: [TablePlugin],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/64
  describe('when inserting blocks inside a table', () => {
    it('should insert the blocks without removing the cells', () => {
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

      const fragment = (
        <fragment>
          <hp>o11a</hp>
          <hp>o11b</hp>
        </fragment>
      ) as any as TElement[];

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>o11a</hp>
                <hp>o11b</hp>
              </htd>
              <htd>
                <hp>o11a</hp>
                <hp>o11b</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        editor: input,
        plugins: [TablePlugin],
      });

      editor.insertFragment(fragment);

      expect(editor.children).toEqual(output.children);
    });
  });
});
