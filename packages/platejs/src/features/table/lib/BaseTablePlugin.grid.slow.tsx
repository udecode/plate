/** @jsxRuntime classic */
/** @jsx jsxt */

import type { TestEditor } from '#platejs-test-internal';
import { jsxt } from '#platejs-test-internal';

import type { Element } from '../../../core';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';

describe('table grid slow contracts', () => {
  jsxt;

  const getTableShape = (element: Element) =>
    JSON.parse(
      JSON.stringify(element, (key, value) =>
        key === 'id' ? undefined : value
      )
    ) as Element;

  describe('table range projection', () => {
    describe('when selection is from cell 12 to 22', () => {
      it.each([
        { allowCellSpanEditing: false },
        { allowCellSpanEditing: true },
      ])(
        'returns the selected right column slice (allowCellSpanEditing: $allowCellSpanEditing)',
        ({ allowCellSpanEditing }) => {
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

          const editor = createTestTableEditor({
            plugins: getTestTablePlugins({ allowCellSpanEditing }),
            selection: input.selection,
            initialValue: input.children,
          });

          const table = editor.read.slice.export().content[0];

          expect(getTableShape(table)).toEqual(getTableShape(output));
        }
      );
    });

    describe('when selection is from cell 21 to 22', () => {
      it.each([
        { allowCellSpanEditing: false },
        { allowCellSpanEditing: true },
      ])(
        'returns the selected bottom row slice (allowCellSpanEditing: $allowCellSpanEditing)',
        ({ allowCellSpanEditing }) => {
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

          const editor = createTestTableEditor({
            plugins: getTestTablePlugins({ allowCellSpanEditing }),
            selection: input.selection,
            initialValue: input.children,
          });

          const table = editor.read.slice.export().content[0];

          expect(getTableShape(table)).toEqual(getTableShape(output));
        }
      );
    });

    describe('when selection is from cell 21 to 11', () => {
      it.each([
        { allowCellSpanEditing: false },
        { allowCellSpanEditing: true },
      ])(
        'returns the selected left column slice when traversing upward (allowCellSpanEditing: $allowCellSpanEditing)',
        ({ allowCellSpanEditing }) => {
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

          const editor = createTestTableEditor({
            plugins: getTestTablePlugins({ allowCellSpanEditing }),
            selection: input.selection,
            initialValue: input.children,
          });

          const table = editor.read.slice.export().content[0];

          expect(getTableShape(table)).toEqual(getTableShape(output));
        }
      );
    });

    describe('when selection is from cell 11 to cell 22', () => {
      it.each([
        { allowCellSpanEditing: false },
        { allowCellSpanEditing: true },
      ])(
        'returns the full 2x2 selection from top-left to bottom-right (allowCellSpanEditing: $allowCellSpanEditing)',
        ({ allowCellSpanEditing }) => {
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

          const editor = createTestTableEditor({
            plugins: getTestTablePlugins({ allowCellSpanEditing }),
            selection: input.selection,
            initialValue: input.children,
          });

          const table = editor.read.slice.export().content[0];

          expect(getTableShape(table)).toEqual(getTableShape(output));
        }
      );
    });

    describe('when selection is from cell 22 to cell 11', () => {
      it.each([
        { allowCellSpanEditing: false },
        { allowCellSpanEditing: true },
      ])(
        'returns the full 2x2 selection from bottom-right to top-left (allowCellSpanEditing: $allowCellSpanEditing)',
        ({ allowCellSpanEditing }) => {
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

          const editor = createTestTableEditor({
            plugins: getTestTablePlugins({ allowCellSpanEditing }),
            selection: input.selection,
            initialValue: input.children,
          });

          const table = editor.read.slice.export().content[0];

          expect(getTableShape(table)).toEqual(getTableShape(output));
        }
      );
    });

    describe('when selection is from cell 12 to cell 21', () => {
      it.each([
        { allowCellSpanEditing: false },
        { allowCellSpanEditing: true },
      ])(
        'returns the full 2x2 selection from top-right to bottom-left (allowCellSpanEditing: $allowCellSpanEditing)',
        ({ allowCellSpanEditing }) => {
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

          const editor = createTestTableEditor({
            plugins: getTestTablePlugins({ allowCellSpanEditing }),
            selection: input.selection,
            initialValue: input.children,
          });

          const table = editor.read.slice.export().content[0];

          expect(getTableShape(table)).toEqual(getTableShape(output));
        }
      );
    });

    describe('when selection is from cell 12 to cell 21', () => {
      it.each([
        { allowCellSpanEditing: false },
        { allowCellSpanEditing: true },
      ])(
        'returns the full 2x2 selection from bottom-left to top-right (allowCellSpanEditing: $allowCellSpanEditing)',
        ({ allowCellSpanEditing }) => {
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

          const editor = createTestTableEditor({
            plugins: getTestTablePlugins({ allowCellSpanEditing }),
            selection: input.selection,
            initialValue: input.children,
          });

          const table = editor.read.slice.export().content[0];

          expect(getTableShape(table)).toEqual(getTableShape(output));
        }
      );
    });
  });
});
