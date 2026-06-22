/** @jsx jsxt */

import { ElementApi, type Element } from '@platejs/slate';
import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { setCellBackground } from './setCellBackground';

jsxt;

// These tests cover the ability to set the background color of a cell or a selection of cells.
// Each test creates an input editor with a cursor in a specific cell,
// sets the background color for the given cell or selection of cells,
// and then checks if the output matches the expected output.
describe('setCellBackground', () => {
  const createEditorInstance = (input: any) =>
    createSlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins(),
      selection: input.selection,
      value: input.children,
    });
  const getFirstRowCells = (
    editor: ReturnType<typeof createEditorInstance>
  ): Element[] => {
    const table = editor.children[0];
    if (!ElementApi.isElement(table)) return [];

    const row = table.children[0];
    if (!ElementApi.isElement(row)) return [];

    return row.children.filter((node): node is Element =>
      ElementApi.isElement(node)
    );
  };

  describe('when background color is not set', () => {
    it('set background color for current cell', () => {
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
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd background="red">
                <hp>
                  11
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editorInstance = createEditorInstance(input);
      setCellBackground(editorInstance, { color: 'red' });

      expect(editorInstance.children).toMatchObject(output.children);
    });

    it('set background color for selected cells', () => {
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
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd background="red">
                <hp>11</hp>
              </htd>
              <htd background="red">
                <hp>12</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editorInstance = createEditorInstance(input);
      setCellBackground(editorInstance, {
        color: 'red',
        selectedCells: getFirstRowCells(editorInstance),
      });

      expect(editorInstance.children).toMatchObject(output.children);
    });
  });

  describe('when background color is set', () => {
    it('remove the background color for current cell', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd background="red">
                <hp>
                  11
                  <cursor />
                </hp>
              </htd>
              <htd background="red">
                <hp>12</hp>
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
              <htd background="red">
                <hp>12</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editorInstance = createEditorInstance(input);
      setCellBackground(editorInstance, { color: null });

      expect(editorInstance.children).toMatchObject(output.children);
    });

    it('reset the background color to transparent for selected cells', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd background="red">
                <hp>11</hp>
              </htd>
              <htd background="blue">
                <hp>12</hp>
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
          </htable>
        </editor>
      ) as any as SlateEditor;

      const editorInstance = createEditorInstance(input);
      setCellBackground(editorInstance, {
        color: null,
        selectedCells: getFirstRowCells(editorInstance),
      });

      expect(editorInstance.children).toMatchObject(output.children);
    });
  });
});
