/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type SlateEditor, type TElement, createSlateEditor } from 'platejs';

import { getTestTablePlugins } from '../withNormalizeTable.spec';
import { getTableGridAbove } from './getTableGridAbove';

jsxt;

// https://github.com/udecode/editor-protocol/issues/12
describe('getTableGridByRange', () => {
  describe('when selection is in cell 1', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('should be [cell 1] (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                1<cursor />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <htable>
          <htr>
            <htd>
              <hp>1</hp>
            </htd>
          </htr>
        </htable>
      ) as any as TElement[];

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toMatchObject(output);
    });
  });

  describe('when selection is from cell 12 to 22', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('should be [12, 22] (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                12
                <anchor />
              </htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                22
                <focus />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

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
      ) as any as TElement;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toMatchObject(output);
    });
  });

  describe('when selection is from cell 21 to 22', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('should be [21, 22] (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>
                21
                <anchor />
              </htd>
              <htd>
                22
                <focus />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

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
      ) as any as TElement;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toMatchObject(output);
    });
  });

  describe('when selection is from cell 21 to 11', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('should be [11, 21] (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <focus />
              </htd>
              <htd>12</htd>
              <htd>13</htd>
            </htr>
            <htr>
              <htd>
                21
                <anchor />
              </htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

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
      ) as any as TElement;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toMatchObject(output);
    });
  });

  describe('when selection is from cell 11 to cell 22', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('should be [11, 12, 21, 22] (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <anchor />
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                22
                <focus />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

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
      ) as any as TElement;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toMatchObject(output);
    });
  });

  describe('when selection is from cell 22 to cell 11', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('should be [11, 12, 21, 22] (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                11
                <focus />
              </htd>
              <htd>12</htd>
            </htr>
            <htr>
              <htd>21</htd>
              <htd>
                22
                <anchor />
              </htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

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
      ) as any as TElement;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toMatchObject(output);
    });
  });

  describe('when selection is from cell 12 to cell 21', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('should be [11, 12, 21, 22] (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                12
                <anchor />
              </htd>
            </htr>
            <htr>
              <htd>
                21
                <focus />
              </htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

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
      ) as any as TElement;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toMatchObject(output);
    });
  });

  describe('when selection is from cell 12 to cell 21', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('should be [11, 12, 21, 22] (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>11</htd>
              <htd>
                12
                <focus />
              </htd>
            </htr>
            <htr>
              <htd>
                21
                <anchor />
              </htd>
              <htd>22</htd>
            </htr>
          </htable>
        </editor>
      ) as any as SlateEditor;

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
      ) as any as TElement;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toMatchObject(output);
    });
  });
});
