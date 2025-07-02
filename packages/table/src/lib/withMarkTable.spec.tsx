/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createPlateEditor } from 'platejs/react';

import { BaseTablePlugin } from './BaseTablePlugin';

jsxt;

describe('withMarkTable', () => {
  describe('when applying marks in a single table cell', () => {
    it('should only affect the selected cell - bold', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext bold>already bold</htext> <anchor />normal<focus />
                </hp>
              </htd>
              <htd>
                <hp>other cell</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext bold>already bold</htext> <htext bold>normal</htext>
                </hp>
              </htd>
              <htd>
                <hp>other cell</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseTablePlugin],
        value: input.children,
        selection: input.selection,
      });

      editor.tf.addMark('bold', true);

      expect(editor.children).toEqual(expected.children);
    });

    it('should only affect the selected cell - code', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext code>already code</htext> <anchor />normal<focus />
                </hp>
              </htd>
              <htd>
                <hp>other cell</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext code>already code</htext> <htext code>normal</htext>
                </hp>
              </htd>
              <htd>
                <hp>other cell</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseTablePlugin],
        value: input.children,
        selection: input.selection,
      });

      editor.tf.addMark('code', true);

      expect(editor.children).toEqual(expected.children);
    });

    it('should not remove marks from other words in the same cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext bold>first bold</htext> <anchor />second<focus /> text
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext bold>first bold</htext> <htext bold>second</htext> text
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseTablePlugin],
        value: input.children,
        selection: input.selection,
      });

      editor.tf.addMark('bold', true);

      expect(editor.children).toEqual(expected.children);
    });

    it('should remove marks only from selected text', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext bold>first bold</htext> <anchor /><htext bold>second bold</htext><focus /> text
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext bold>first bold</htext> second bold text
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseTablePlugin],
        value: input.children,
        selection: input.selection,
      });

      editor.tf.removeMark('bold');

      expect(editor.children).toEqual(expected.children);
    });
  });

  describe('when applying marks across multiple table cells', () => {
    it('should apply marks to all selected cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />cell one
                </hp>
              </htd>
              <htd>
                <hp>
                  cell two<focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext bold>cell one</htext>
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext bold>cell two</htext>
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseTablePlugin],
        value: input.children,
        selection: input.selection,
      });

      editor.tf.addMark('bold', true);

      expect(editor.children).toEqual(expected.children);
    });

    it('should remove marks from all selected cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor /><htext bold>cell one</htext>
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext bold>cell two</htext><focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  cell one
                </hp>
              </htd>
              <htd>
                <hp>
                  cell two
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseTablePlugin],
        value: input.children,
        selection: input.selection,
      });

      editor.tf.removeMark('bold');

      expect(editor.children).toEqual(expected.children);
    });
  });

  describe('when using setNodes in a table cell', () => {
    it('should only affect nodes in the selected cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />text in cell one<focus />
                </hp>
              </htd>
              <htd>
                <hp>text in cell two</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const expected = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext bold>text in cell one</htext>
                </hp>
              </htd>
              <htd>
                <hp>text in cell two</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseTablePlugin],
        value: input.children,
        selection: input.selection,
      });

      // Using setNodes directly to simulate other operations that might use it
      editor.tf.setNodes(
        { bold: true },
        {
          match: (n) => editor.api.isText(n),
          split: true,
        }
      );

      expect(editor.children).toEqual(expected.children);
    });
  });
});