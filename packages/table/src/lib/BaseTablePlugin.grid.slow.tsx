/** @jsx jsxt */

import { BaseTablePlugin } from './BaseTablePlugin';
import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { createPlateEditor } from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import type { TestEditor } from '@platejs/test-utils';

describe('table grid slow contracts', () => {
  jsxt;

  const getTableShape = (element: Element) =>
    JSON.parse(
      JSON.stringify(element, (key, value) =>
        key === 'id' ? undefined : value
      )
    ) as Element;

  describe('getTableGridByRange', () => {
    describe('when selection is in cell 1', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('returns the selected single cell (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    1<cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const output = (
          <htable>
            <htr>
              <htd>
                <hp>1</hp>
              </htd>
            </htr>
          </htable>
        ) as Element;

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const table = editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0];

        expect(getTableShape(table)).toEqual(getTableShape(output));
      });
    });

    describe('when selection is from cell 12 to 22', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('returns the selected right column slice (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
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
                    <anchor />
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>
                    22
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const output = (
          <htable>
            <htr>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        ) as Element;

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const table = editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0];

        expect(getTableShape(table)).toEqual(getTableShape(output));
      });
    });

    describe('when selection is from cell 21 to 22', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('returns the selected bottom row slice (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
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
                    <anchor />
                  </hp>
                </htd>
                <htd>
                  <hp>
                    22
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const output = (
          <htable>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        ) as Element;

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const table = editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0];

        expect(getTableShape(table)).toEqual(getTableShape(output));
      });
    });

    describe('when selection is from cell 21 to 11', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('returns the selected left column slice when traversing upward (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    11
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
                <htd>
                  <hp>13</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    21
                    <anchor />
                  </hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const output = (
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        ) as Element;

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const table = editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0];

        expect(getTableShape(table)).toEqual(getTableShape(output));
      });
    });

    describe('when selection is from cell 11 to cell 22', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('returns the full 2x2 selection from top-left to bottom-right (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    11
                    <anchor />
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
                  <hp>
                    22
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const output = (
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
        ) as Element;

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const table = editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0];

        expect(getTableShape(table)).toEqual(getTableShape(output));
      });
    });

    describe('when selection is from cell 22 to cell 11', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('returns the full 2x2 selection from bottom-right to top-left (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    11
                    <focus />
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
                  <hp>
                    22
                    <anchor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const output = (
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
        ) as Element;

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const table = editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0];

        expect(getTableShape(table)).toEqual(getTableShape(output));
      });
    });

    describe('when selection is from cell 12 to cell 21', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('returns the full 2x2 selection from top-right to bottom-left (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
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
                    <anchor />
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    21
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const output = (
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
        ) as Element;

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const table = editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0];

        expect(getTableShape(table)).toEqual(getTableShape(output));
      });
    });

    describe('when selection is from cell 12 to cell 21', () => {
      it.each([
        { disableMerge: true },
        { disableMerge: false },
      ])('returns the full 2x2 selection from bottom-left to top-right (disableMerge: $disableMerge)', ({
        disableMerge,
      }) => {
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
                    <focus />
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    21
                    <anchor />
                  </hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const output = (
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
        ) as Element;

        const editor = createPlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          initialValue: input.children,
        });

        const table = editor.plugin(BaseTablePlugin).api.getGridAbove()[0][0];

        expect(getTableShape(table)).toEqual(getTableShape(output));
      });
    });
  });
});
