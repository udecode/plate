/** @jsx jsxt */

import { BaseTablePlugin } from './BaseTablePlugin';
import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { createPlateEditor } from '@platejs/core/react';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';

describe('table navigation', () => {
  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    describe('getCellInNextTableRow', () => {
      it('returns the first cell from the next row', () => {
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
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const nextCell = editor
          .plugin(BaseTablePlugin)
          .api.getCellInNextRow([0, 0])!;

        expect(nextCell[1]).toEqual([0, 1, 0]);
        expect(editor.read.text.string(nextCell[1])).toBe('21');
      });

      it('returns undefined when there is no next row', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        expect(
          editor.plugin(BaseTablePlugin).api.getCellInNextRow([0, 0])
        ).toBeUndefined();
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    describe('getCellInPreviousTableRow', () => {
      it('returns the last cell from the previous row', () => {
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
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const previousCell = editor
          .plugin(BaseTablePlugin)
          .api.getCellInPreviousRow([0, 1])!;

        expect(previousCell[1]).toEqual([0, 0, 1]);
        expect(editor.read.text.string(previousCell[1])).toBe('12');
      });

      it('returns undefined when there is no previous row', () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);

        expect(
          editor.plugin(BaseTablePlugin).api.getCellInPreviousRow([0, 0])
        ).toBeUndefined();
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    describe('getNextTableCell', () => {
      it('returns the next sibling cell when one exists', () => {
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
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const currentCell = editor.read.nodes.get([0, 0, 0])!;
        const currentRow = editor.read.nodes.get([0, 0])!;

        const nextCell = editor
          .plugin(BaseTablePlugin)
          .api.getNextCell(currentCell, [0, 0, 0], currentRow)!;

        expect(nextCell[1]).toEqual([0, 0, 1]);
        expect(editor.read.text.string(nextCell[1])).toBe('12');
      });

      it('falls back to the next row first cell when the current cell is last in the row', () => {
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
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const currentCell = editor.read.nodes.get([0, 0, 1])!;
        const currentRow = editor.read.nodes.get([0, 0])!;

        const nextCell = editor
          .plugin(BaseTablePlugin)
          .api.getNextCell(currentCell, [0, 0, 1], currentRow)!;

        expect(nextCell[1]).toEqual([0, 1, 0]);
        expect(editor.read.text.string(nextCell[1])).toBe('21');
      });
    });
  }

  {
    jsxt;

    const createTableEditor = (input: TestEditor) =>
      createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });

    describe('getPreviousTableCell', () => {
      it('returns the previous sibling cell when one exists', () => {
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
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const currentCell = editor.read.nodes.get([0, 0, 1])!;
        const currentRow = editor.read.nodes.get([0, 0])!;

        const previousCell = editor
          .plugin(BaseTablePlugin)
          .api.getPreviousCell(currentCell, [0, 0, 1], currentRow)!;

        expect(previousCell[1]).toEqual([0, 0, 0]);
        expect(editor.read.text.string(previousCell[1])).toBe('11');
      });

      it('falls back to the previous row last cell when the current cell is first in the row', () => {
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
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTableEditor(input);
        const currentCell = editor.read.nodes.get([0, 1, 0])!;
        const currentRow = editor.read.nodes.get([0, 1])!;

        const previousCell = editor
          .plugin(BaseTablePlugin)
          .api.getPreviousCell(currentCell, [0, 1, 0], currentRow)!;

        expect(previousCell[1]).toEqual([0, 0, 1]);
        expect(editor.read.text.string(previousCell[1])).toBe('12');
      });
    });
  }
});
