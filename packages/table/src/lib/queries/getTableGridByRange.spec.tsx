/** @jsx jsxt */

import {
  type SlateEditor,
  type TElement,
  createSlateEditor,
} from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseTablePlugin } from '../../lib/BaseTablePlugin';
import { getTableGridAbove } from './getTableGridAbove';

jsxt;

// https://github.com/udecode/editor-protocol/issues/12
describe('getTableGridByRange', () => {
  describe('when selection is in cell 1', () => {
    it('should be [cell 1]', () => {
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
            <htd>1</htd>
          </htr>
        </htable>
      ) as any as TElement[];

      const editor = createSlateEditor({
        editor: input,
        plugins: [BaseTablePlugin],
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toEqual(output);
    });
  });

  describe('when selection is from cell 12 to 22', () => {
    it('should be [12, 22]', () => {
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
            <htd>12</htd>
          </htr>
          <htr>
            <htd>22</htd>
          </htr>
        </htable>
      ) as any as TElement;

      const editor = createSlateEditor({
        editor: input,
        plugins: [BaseTablePlugin],
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toEqual(output);
    });
  });

  describe('when selection is from cell 21 to 22', () => {
    it('should be [21, 22]', () => {
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
            <htd>21</htd>
            <htd>22</htd>
          </htr>
        </htable>
      ) as any as TElement;

      const editor = createSlateEditor({
        editor: input,
        plugins: [BaseTablePlugin],
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toEqual(output);
    });
  });

  describe('when selection is from cell 21 to 11', () => {
    it('should be [11, 21]', () => {
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
            <htd>11</htd>
          </htr>
          <htr>
            <htd>21</htd>
          </htr>
        </htable>
      ) as any as TElement;

      const editor = createSlateEditor({
        editor: input,
        plugins: [BaseTablePlugin],
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toEqual(output);
    });
  });

  describe('when selection is from cell 11 to cell 22', () => {
    it('should be [11, 12, 21, 22]', () => {
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
            <htd>11</htd>
            <htd>12</htd>
          </htr>
          <htr>
            <htd>21</htd>
            <htd>22</htd>
          </htr>
        </htable>
      ) as any as TElement;

      const editor = createSlateEditor({
        editor: input,
        plugins: [BaseTablePlugin],
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toEqual(output);
    });
  });

  describe('when selection is from cell 22 to cell 11', () => {
    it('should be [11, 12, 21, 22]', () => {
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
            <htd>11</htd>
            <htd>12</htd>
          </htr>
          <htr>
            <htd>21</htd>
            <htd>22</htd>
          </htr>
        </htable>
      ) as any as TElement;

      const editor = createSlateEditor({
        editor: input,
        plugins: [BaseTablePlugin],
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toEqual(output);
    });
  });

  describe('when selection is from cell 12 to cell 21', () => {
    it('should be [11, 12, 21, 22]', () => {
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
            <htd>11</htd>
            <htd>12</htd>
          </htr>
          <htr>
            <htd>21</htd>
            <htd>22</htd>
          </htr>
        </htable>
      ) as any as TElement;

      const editor = createSlateEditor({
        editor: input,
        plugins: [BaseTablePlugin],
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toEqual(output);
    });
  });

  describe('when selection is from cell 12 to cell 21', () => {
    it('should be [11, 12, 21, 22]', () => {
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
            <htd>11</htd>
            <htd>12</htd>
          </htr>
          <htr>
            <htd>21</htd>
            <htd>22</htd>
          </htr>
        </htable>
      ) as any as TElement;

      const editor = createSlateEditor({
        editor: input,
        plugins: [BaseTablePlugin],
      });

      const table = getTableGridAbove(editor)[0][0];

      expect(table).toEqual(output);
    });
  });
});
