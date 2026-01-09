/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { MarkdownPlugin } from '@platejs/markdown';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import {
  BaseParagraphPlugin,
  type SlateEditor,
  createSlateEditor,
} from 'platejs';

import { getMarkdown } from './getMarkdown';

jsxt;

const createTestEditor = (input: SlateEditor) =>
  createSlateEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseTablePlugin,
      BaseTableRowPlugin,
      BaseTableCellPlugin,
      BaseTableCellHeaderPlugin,
      MarkdownPlugin,
    ],
    selection: input.selection,
    value: input.children,
  });

describe('getMarkdown', () => {
  describe('tableCellWithId', () => {
    it('should use CellRef placeholder in table and Cell blocks after', () => {
      const input = (
        <editor>
          <htable id="t1">
            <htr id="t1_r1">
              <htd id="t1_r1_c1">
                <hp>张三</hp>
              </htd>
              <htd id="t1_r1_c2">
                <hp>28</hp>
              </htd>
              <htd id="t1_r1_c3">
                <hp>北京</hp>
              </htd>
              <htd id="t1_r1_c4">
                <hp>工程师</hp>
              </htd>
            </htr>
            <htr id="t1_r2">
              <htd id="t1_r2_c1">
                <hp>李四</hp>
              </htd>
              <htd id="t1_r2_c2">
                <hp>34</hp>
              </htd>
              <htd id="t1_r2_c3">
                <hp>上海</hp>
              </htd>
              <htd id="t1_r2_c4">
                <hp>
                  <anchor />
                  产品经理
                </hp>
              </htd>
            </htr>
            <htr id="t1_r3">
              <htd id="t1_r3_c1">
                <hp>王五</hp>
              </htd>
              <htd id="t1_r3_c2">
                <hp>25</hp>
              </htd>
              <htd id="t1_r3_c3">
                <hp>深圳</hp>
              </htd>
              <htd id="t1_r3_c4">
                <hp>
                  设计师
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTestEditor(input);

      const result = getMarkdown(editor, {
        type: 'tableCellWithId',
      });

      // Table should have CellRef placeholders for selected cells
      expect(result).toContain('<CellRef id="t1_r2_c4" />');
      expect(result).toContain('<CellRef id="t1_r3_c4" />');

      // Cell content blocks should appear after the table
      expect(result).toContain('<Cell id="t1_r2_c4">\n产品经理\n</Cell>');
      expect(result).toContain('<Cell id="t1_r3_c4">\n设计师\n</Cell>');

      // Non-selected cells should NOT have CellRef
      expect(result).not.toContain('<CellRef id="t1_r1_c4"');
      expect(result).toContain('| 工程师 |');
    });

    it('should handle single cell selection', () => {
      const input = (
        <editor>
          <htable id="t1">
            <htr id="t1_r1">
              <htd id="t1_r1_c1">
                <hp>
                  <anchor />
                  内容
                  <focus />
                </hp>
              </htd>
              <htd id="t1_r1_c2">
                <hp>其他</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTestEditor(input);

      const result = getMarkdown(editor, {
        type: 'tableCellWithId',
      });

      // Table should have CellRef placeholder
      expect(result).toContain('<CellRef id="t1_r1_c1" />');

      // Cell content block should appear after table
      expect(result).toContain('<Cell id="t1_r1_c1">\n内容\n</Cell>');

      // Non-selected cell should not have CellRef
      expect(result).not.toContain('<CellRef id="t1_r1_c2"');
    });

    it('should handle cells with multiple paragraphs (multi-block support)', () => {
      const input = (
        <editor>
          <htable id="t1">
            <htr id="t1_r1">
              <htd id="t1_r1_c1">
                <hp>
                  <anchor />
                  第一行
                </hp>
                <hp>
                  第二行
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createTestEditor(input);

      const result = getMarkdown(editor, {
        type: 'tableCellWithId',
      });

      // Table should have CellRef placeholder
      expect(result).toContain('<CellRef id="t1_r1_c1" />');

      // Cell content block should preserve multiple paragraphs
      expect(result).toContain(
        '<Cell id="t1_r1_c1">\n第一行\n\n第二行\n</Cell>'
      );
    });
  });
});
