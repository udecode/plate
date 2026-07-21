/** @jsx jsxt */

import assert from 'node:assert/strict';
import { createPlateEditor } from '@platejs/core/react';
import type { TTableCellElement } from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { setCellBackground } from './setCellBackground';

jsxt;

// These tests cover the ability to set the background color of a cell or a selection of cells.
// Each test creates an input editor with a cursor in a specific cell,
// sets the background color for the given cell or selection of cells,
// and then checks if the output matches the expected output.
describe('setCellBackground', () => {
  const createEditorInstance = (input: TestEditor) =>
    createPlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins(),
      selection: input.selection,
      value: input.children,
    });

  const getCell = (
    editor: ReturnType<typeof createEditorInstance>,
    path: number[]
  ) => {
    const entry = editor.read.nodes.get<TTableCellElement>(path);
    assert(entry);

    return entry[0];
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
      ) as TestEditor;

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
      ) as TestEditor;

      const editorInstance = createEditorInstance(input);
      setCellBackground(editorInstance, { color: 'red' });

      expect(editorInstance.read.children()).toMatchObject(output.children!);
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
      ) as TestEditor;

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
      ) as TestEditor;

      const editorInstance = createEditorInstance(input);
      const selection = editorInstance.read.selection();
      let commits = 0;

      editorInstance.subscribeCommit(() => commits++);
      setCellBackground(editorInstance, {
        color: 'red',
        selectedCells: [
          getCell(editorInstance, [0, 0, 0]),
          getCell(editorInstance, [0, 0, 1]),
        ],
      });

      expect(editorInstance.read.children()).toMatchObject(output.children!);
      expect(editorInstance.read.selection()).toEqual(selection);
      expect(commits).toBe(1);
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
      ) as TestEditor;

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
      ) as TestEditor;

      const editorInstance = createEditorInstance(input);
      setCellBackground(editorInstance, { color: null });

      expect(editorInstance.read.children()).toMatchObject(output.children!);
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
      ) as TestEditor;

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
      ) as TestEditor;

      const editorInstance = createEditorInstance(input);
      setCellBackground(editorInstance, {
        color: null,
        selectedCells: [
          getCell(editorInstance, [0, 0, 0]),
          getCell(editorInstance, [0, 0, 1]),
        ],
      });

      expect(editorInstance.read.children()).toMatchObject(output.children!);
    });
  });
});
