/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { getTestTablePlugins } from '../withNormalizeTable.spec';
import { setCellBackground } from './setCellBackground';

jsxt;

// These tests cover the ability to set the background color of a cell or a selection of cells.
// Each test creates an input editor with a cursor in a specific cell,
// sets the background color for the given cell or selection of cells,
// and then checks if the output matches the expected output.
describe('setCellBackground', () => {
  const createEditorInstance = (input: any) => {
    return createPlateEditor({
      plugins: getTestTablePlugins(),
      selection: input.selection,
      value: input.children,
    });
  };

  describe('when background color is not set', () => {
    it('should set background color for current cell', () => {
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

    it('should set background color for selected cells', () => {
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
        selectedCells: [
          editorInstance.children[0].children[0].children[0],
          editorInstance.children[0].children[0].children[1],
        ],
      });

      expect(editorInstance.children).toMatchObject(output.children);
    });
  });

  describe('when background color is set', () => {
    it('should remove the background color for current cell', () => {
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

    it('should reset the background color to transparent for selected cells', () => {
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
        selectedCells: [
          editorInstance.children[0].children[0].children[0],
          editorInstance.children[0].children[0].children[1],
        ],
      });

      expect(editorInstance.children).toMatchObject(output.children);
    });
  });
});
