/** @jsx jsxt */

import {
  type Value,
  createSlateEditor,
  normalizeEditor,
} from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseTablePlugin } from './BaseTablePlugin';

jsxt;

describe('withNormalizeTable', () => {
  // https://github.com/udecode/editor-protocol/issues/65
  describe('cell child is a text', () => {
    it('should wrap the children into a p', async () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <htext>a</htext>
                <htext bold>b</htext>
                <htext italic>c</htext>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const output = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext>a</htext>
                  <htext bold>b</htext>
                  <htext italic>c</htext>
                </hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        plugins: [BaseTablePlugin],
        value: input,
      });

      normalizeEditor(editor, {
        force: true,
      });
      expect(editor.children).toEqual(output);
    });
  });

  describe('initialTableWidth is defined and colSizes is not defined', () => {
    it('should set colSizes', () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
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
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const output = (
        <fragment>
          <htable colSizes={[30, 30, 30]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
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
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        plugins: [
          BaseTablePlugin.configure({
            options: {
              initialTableWidth: 90,
            },
          }),
        ],
        value: input,
      });

      normalizeEditor(editor, {
        force: true,
      });
      expect(editor.children).toEqual(output);
    });
  });

  describe('initialTableWidth is defined and colSizes is partially defined', () => {
    it('should set colSizes', () => {
      const input = (
        <fragment>
          <htable colSizes={[0, 40, 0]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
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
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const output = (
        <fragment>
          <htable colSizes={[30, 40, 30]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
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
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        plugins: [
          BaseTablePlugin.configure({
            options: {
              initialTableWidth: 90,
            },
          }),
        ],
        value: input,
      });

      normalizeEditor(editor, {
        force: true,
      });
      expect(editor.children).toEqual(output);
    });
  });

  describe('initialTableWidth is defined and colSizes is fully defined', () => {
    it('should do nothing', () => {
      const input = (
        <fragment>
          <htable colSizes={[40, 40, 40]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
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
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const output = (
        <fragment>
          <htable colSizes={[40, 40, 40]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
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
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        plugins: [
          BaseTablePlugin.configure({
            options: {
              initialTableWidth: 90,
            },
          }),
        ],
        value: input,
      });

      normalizeEditor(editor, {
        force: true,
      });
      expect(editor.children).toEqual(output);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/76
  describe('table in a table', () => {
    it('should unwrap the nested table, tr, td', async () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
                <htable>
                  <htr>
                    <htd>
                      <hp>b</hp>
                    </htd>
                    <htd>
                      <hp>c</hp>
                    </htd>
                  </htr>
                </htable>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const output = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
                <hp>b</hp>
                <hp>c</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        plugins: [BaseTablePlugin],
        value: input,
      });

      normalizeEditor(editor, {
        force: true,
      });
      expect(editor.children).toEqual(output);
    });
  });
});
