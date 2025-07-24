/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { IndentPlugin } from '@platejs/indent/react';
import { BaseListPlugin } from '@platejs/list';
import { toggleList } from '@platejs/list';
import { jsxt } from '@platejs/test-utils';
import { createPlateEditor } from 'platejs/react';

import { getTestTablePlugins } from './withNormalizeTable.spec';

jsxt;

describe('withTableCellSelection', () => {
  describe('marks() API', () => {
    describe('when collapsed selection', () => {
      it('should use default marks behavior', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold>te</htext>
                    <cursor />
                    <htext bold>st</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        // Since selection is collapsed, it should use the default marks behavior
        const marks = editor.api.marks();
        expect(marks).toEqual({ bold: true });
      });
    });

    describe('when selection spans single cell', () => {
      it('should use default marks behavior', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold>
                      <anchor />
                      test
                      <focus />
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        const marks = editor.api.marks();
        expect(marks).toEqual({ bold: true });
      });
    });

    describe('when selection spans multiple cells', () => {
      it('should return marks common to all text nodes in selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold italic>
                      <anchor />
                      test1
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext bold>test3</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>
                      test4
                      <focus />
                    </htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        const marks = editor.api.marks();
        expect(marks).toEqual({ bold: true });
      });

      it('should not return marks that are not present in all text nodes', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold italic>
                      <anchor />
                      test1
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext bold>test3</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext italic>
                      test4
                      <focus />
                    </htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        const marks = editor.api.marks();
        expect(marks).toEqual({});
      });

      it('should handle cells with mixed text and marked text', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold>
                      <anchor />
                      bold
                    </htext>
                    <htext> plain</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>all bold</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext bold>bold</htext>
                    <htext> plain</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>
                      all bold
                      <focus />
                    </htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        const marks = editor.api.marks();
        expect(marks).toEqual({});
      });

      it('should handle cells with only text nodes without text property', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext>
                      <anchor />
                      plain
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>plain</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext>plain</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>
                      plain
                      <focus />
                    </htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        const marks = editor.api.marks();
        expect(marks).toEqual({});
      });
    });
  });

  describe('addMark transform', () => {
    describe('when collapsed selection', () => {
      it('should use default addMark behavior', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    te
                    <cursor />
                    st
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.addMark('bold', true);
        expect(editor.marks).toEqual({ bold: true });
      });
    });

    describe('when selection spans single cell', () => {
      it('should call original addMark', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext>
                      <anchor />
                      test
                      <focus />
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
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
                    <htext bold>test</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.addMark('bold', true);
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when selection spans multiple cells', () => {
      it('should add mark to all text nodes in selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext>
                      <anchor />
                      test1
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext>test3</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>
                      test4
                      <focus />
                    </htext>
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
                  <hp>
                    <htext bold>test1</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext bold>test3</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>test4</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.addMark('bold', true);
        expect(editor.children).toEqual(output.children);
      });

      it('should add mark to multiple text nodes in same cell', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext>
                      <anchor />
                      plain
                    </htext>
                    <htext italic> italic</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext>test3</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>
                      test4
                      <focus />
                    </htext>
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
                  <hp>
                    <htext bold>plain</htext>
                    <htext bold italic>
                      {' '}
                      italic
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext bold>test3</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>test4</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.addMark('bold', true);
        expect(editor.children).toEqual(output.children);
      });
    });
  });

  describe('removeMark transform', () => {
    describe('when collapsed selection', () => {
      it('should use default removeMark behavior', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold>te</htext>
                    <cursor />
                    <htext bold>st</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.marks = { bold: true };
        editor.tf.removeMark('bold');
        expect(editor.marks).toEqual({});
      });
    });

    describe('when selection spans single cell', () => {
      it('should call original removeMark', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold>
                      <anchor />
                      test
                      <focus />
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
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
                    <htext>test</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.removeMark('bold');
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when selection spans multiple cells', () => {
      it('should remove mark from all text nodes in selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold>
                      <anchor />
                      test1
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext bold>test3</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>
                      test4
                      <focus />
                    </htext>
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
                  <hp>
                    <htext>test1</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext>test3</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>test4</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.removeMark('bold');
        expect(editor.children).toEqual(output.children);
      });

      it('should remove mark from mixed text nodes', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold>
                      <anchor />
                      bold
                    </htext>
                    <htext bold italic>
                      {' '}
                      bold italic
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext>plain</htext>
                    <htext bold> bold</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold>
                      test4
                      <focus />
                    </htext>
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
                  <hp>
                    <htext>bold</htext>
                    <htext italic> bold italic</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>test2</htext>
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext>plain bold</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext>test4</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.removeMark('bold');
        expect(editor.children).toEqual(output.children);
      });

      it('should only remove specified mark and keep others', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext bold italic>
                      <anchor />
                      test1
                    </htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext bold italic>
                      test2
                      <focus />
                    </htext>
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
                  <hp>
                    <htext italic>test1</htext>
                  </hp>
                </htd>
                <htd>
                  <hp>
                    <htext italic>test2</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.removeMark('bold');
        expect(editor.children).toEqual(output.children);
      });
    });
  });

  describe('setNodes for alignment', () => {
    describe('when selection spans multiple cells horizontally', () => {
      it('should set align property on all selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    cell1
                  </hp>
                </htd>
                <htd>
                  <hp>
                    cell2
                    <focus />
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
                  <hp align="center">cell1</hp>
                </htd>
                <htd>
                  <hp align="center">cell2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.setNodes(
          { align: 'center' },
          { match: (node) => node.type === 'p' }
        );
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when selection spans multiple cells vertically', () => {
      it('should set align property on all selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    row1col1
                  </hp>
                </htd>
                <htd>
                  <hp>row1col2</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    row2col1
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp>row2col2</hp>
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
                  <hp align="center">row1col1</hp>
                </htd>
                <htd>
                  <hp>row1col2</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp align="center">row2col1</hp>
                </htd>
                <htd>
                  <hp>row2col2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.setNodes(
          { align: 'center' },
          { match: (node) => node.type === 'p' }
        );
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when selection spans all cells (table selection)', () => {
      it('should set align property on all cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    cell1
                  </hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>cell3</hp>
                </htd>
                <htd>
                  <hp>
                    cell4
                    <focus />
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
                  <hp align="center">cell1</hp>
                </htd>
                <htd>
                  <hp align="center">cell2</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp align="center">cell3</hp>
                </htd>
                <htd>
                  <hp align="center">cell4</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.setNodes(
          { align: 'center' },
          { match: (node) => node.type === 'p' }
        );
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when selection spans single cell', () => {
      it('should use default setNodes behavior', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    cell1
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
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
                  <hp align="center">cell1</hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.setNodes(
          { align: 'center' },
          { match: (node) => node.type === 'p' }
        );
        expect(editor.children).toEqual(output.children);
      });
    });
  });

  describe('unsetNodes for alignment', () => {
    describe('when selection spans multiple cells horizontally', () => {
      it('should unset align property on all selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp align="center">
                    <anchor />
                    cell1
                  </hp>
                </htd>
                <htd>
                  <hp align="center">
                    cell2
                    <focus />
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
                  <hp>cell1</hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.unsetNodes('align', { match: (node) => node.type === 'p' });
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when selection spans multiple cells vertically', () => {
      it('should unset align property on all selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp align="center">
                    <anchor />
                    row1col1
                  </hp>
                </htd>
                <htd>
                  <hp align="right">row1col2</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp align="center">
                    row2col1
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp align="right">row2col2</hp>
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
                  <hp>row1col1</hp>
                </htd>
                <htd>
                  <hp align="right">row1col2</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>row2col1</hp>
                </htd>
                <htd>
                  <hp align="right">row2col2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.unsetNodes('align', { match: (node) => node.type === 'p' });
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when selection spans all cells (table selection)', () => {
      it('should unset align property on all cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp align="left">
                    <anchor />
                    cell1
                  </hp>
                </htd>
                <htd>
                  <hp align="center">cell2</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp align="right">cell3</hp>
                </htd>
                <htd>
                  <hp align="justify">
                    cell4
                    <focus />
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
                  <hp>cell1</hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>cell3</hp>
                </htd>
                <htd>
                  <hp>cell4</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.unsetNodes('align', { match: (node) => node.type === 'p' });
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when selection spans single cell', () => {
      it('should use default unsetNodes behavior', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp align="center">
                    <anchor />
                    cell1
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp align="right">cell2</hp>
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
                  <hp>cell1</hp>
                </htd>
                <htd>
                  <hp align="right">cell2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.unsetNodes('align', { match: (node) => node.type === 'p' });
        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when unsetting multiple properties', () => {
      it('should unset all specified properties', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp align="center" indent={1}>
                    <anchor />
                    cell1
                  </hp>
                </htd>
                <htd>
                  <hp align="right" indent={2}>
                    cell2
                    <focus />
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
                  <hp>cell1</hp>
                </htd>
                <htd>
                  <hp>cell2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.unsetNodes(['align', 'indent'], {
          match: (node) => node.type === 'p',
        });
        expect(editor.children).toEqual(output.children);
      });
    });
  });

  describe('nodes() API', () => {
    describe('when selection spans multiple cells', () => {
      it('should iterate through nodes in all selected cells', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    paragraph1
                  </hp>
                  <hh1>heading1</hh1>
                </htd>
                <htd>
                  <hp>
                    paragraph2
                    <focus />
                  </hp>
                  <hh1>heading2</hh1>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        // Collect all paragraph nodes
        const paragraphs = Array.from(
          editor.api.nodes({
            match: (node) => node.type === 'p',
          })
        );

        expect(paragraphs).toHaveLength(2);
        expect((paragraphs[0][0] as any).children[0].text).toBe('paragraph1');
        expect((paragraphs[1][0] as any).children[0].text).toBe('paragraph2');
      });

      it('should iterate through all nodes when no match is provided', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    p1
                  </hp>
                  <hh1>h1</hh1>
                </htd>
                <htd>
                  <hp>
                    p2
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        // Collect all block nodes
        const blocks = Array.from(
          editor.api.nodes({
            match: (node) => editor.api.isBlock(node),
          })
        );

        // When iterating through selected cells, we get all nodes including table structure
        // Filter to only get the content nodes (p, h1)
        const contentBlocks = blocks.filter(
          ([node]) => node.type === 'p' || node.type === 'h1'
        );

        expect(contentBlocks).toHaveLength(3);
        expect(contentBlocks[0][0].type).toBe('p');
        expect(contentBlocks[1][0].type).toBe('h1');
        expect(contentBlocks[2][0].type).toBe('p');
      });
    });

    describe('when selection is in single cell', () => {
      it('should use default nodes behavior', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    paragraph1
                    <focus />
                  </hp>
                  <hh1>heading1</hh1>
                </htd>
                <htd>
                  <hp>paragraph2</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        const editor = createPlateEditor({
          plugins: getTestTablePlugins(),
          selection: input.selection,
          value: input.children,
        });

        // Should only get nodes from the selected cell
        const paragraphs = Array.from(
          editor.api.nodes({
            match: (node) => node.type === 'p',
          })
        );

        expect(paragraphs).toHaveLength(1);
        expect((paragraphs[0][0].children as any)[0].text).toBe('paragraph1');
      });
    });
  });

  describe('toggleList integration', () => {
    it('should turn on list across multiple cells', () => {
      // TODO: Fix list integration with table cell selection
      // Currently, list properties are being set on text nodes instead of paragraph nodes
      // when using the combined match function approach
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  item1
                </hp>
                <hp>item2</hp>
              </htd>
              <htd>
                <hp>item3</hp>
                <hp>item4</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  item5
                  <focus />
                </hp>
                <hp>item6</hp>
              </htd>
              <htd>
                <hp>item7</hp>
                <hp>item8</hp>
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
                <hp indent={1} listStyleType="disc">
                  item1
                </hp>
                <hp indent={1} listStart={2} listStyleType="disc">
                  item2
                </hp>
              </htd>
              <htd>
                <hp>item3</hp>
                <hp>item4</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp indent={1} listStyleType="disc">
                  item5
                </hp>
                <hp>item6</hp>
              </htd>
              <htd>
                <hp>item7</hp>
                <hp>item8</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [...getTestTablePlugins(), BaseListPlugin, IndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      toggleList(editor, { listStyleType: 'disc' });

      expect(editor.children).toEqual(output.children);
    });

    // This requires to override api.nodes
    it.skip('should turn off list across multiple cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp indent={1} listStyleType="disc">
                  <anchor />
                  item1
                </hp>
                <hp indent={1} listStart={2} listStyleType="disc">
                  item2
                </hp>
              </htd>
              <htd>
                <hp>item3</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp indent={1} listStyleType="disc">
                  item4
                  <focus />
                </hp>
                <hp indent={1} listStart={2} listStyleType="disc">
                  item5
                </hp>
              </htd>
              <htd>
                <hp>item6</hp>
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
                <hp>item1</hp>
                <hp>item2</hp>
              </htd>
              <htd>
                <hp indent={1} listStyleType="disc">
                  item3
                </hp>
                <hp indent={1} listStart={2} listStyleType="disc">
                  item4
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>item4</hp>
                <hp indent={1} listStyleType="disc">
                  item5
                </hp>
              </htd>
              <htd>
                <hp>item6</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [...getTestTablePlugins(), BaseListPlugin, IndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      toggleList(editor, { listStyleType: 'disc' });

      expect(editor.children).toEqual(output.children);
    });
  });
});
