/** @jsx jsxt */
import { describe, expect, test as it } from 'bun:test';

import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../../editor';
import { createSlatePlugin } from '../../../plugin/createSlatePlugin';
import { insertExitBreak } from './insertExitBreak';

jsxt;

describe('exitBreak', () => {
  describe('basic functionality', () => {
    it('should exit break when no isExitable logic applies', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test</hp>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        selection: input.selection,
        value: input.children,
      });

      const result = insertExitBreak(editor);

      expect(editor.children).toEqual(output.children);
      expect(result).toBe(true);
    });

    it('should exit break with reverse option', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
          <hp>test</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        selection: input.selection,
        value: input.children,
      });

      const result = insertExitBreak(editor, { reverse: true });

      expect(editor.children).toEqual(output.children);
      expect(result).toBe(true);
    });
  });

  describe('isStrictSiblings behavior', () => {
    it('should exit from codeblock when cursor is in codeline', () => {
      const input = (
        <editor>
          <element type="codeblock">
            <element type="codeline">
              code
              <cursor />
            </element>
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="codeblock">
            <element type="codeline">code</element>
          </element>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'codeblock',
            node: {
              isElement: true,
              isStrictSiblings: false,
              type: 'codeblock',
            },
          }),
          createSlatePlugin({
            key: 'codeline',
            node: { isElement: true, isStrictSiblings: true, type: 'codeline' },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      const result = insertExitBreak(editor);

      expect(editor.children).toEqual(output.children);
      expect(result).toBe(true);
    });

    it('should exit from table when cursor is in td', () => {
      const input = (
        <editor>
          <element type="table">
            <element type="tr">
              <element type="td">
                cell content
                <cursor />
              </element>
            </element>
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="table">
            <element type="tr">
              <element type="td">cell content</element>
            </element>
          </element>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'table',
            node: { isElement: true, isStrictSiblings: false, type: 'table' },
          }),
          createSlatePlugin({
            key: 'tr',
            node: { isElement: true, isStrictSiblings: true, type: 'tr' },
          }),
          createSlatePlugin({
            key: 'td',
            node: { isElement: true, isStrictSiblings: true, type: 'td' },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      const result = insertExitBreak(editor);

      expect(editor.children).toEqual(output.children);
      expect(result).toBe(true);
    });

    it('should handle nested column structure: exit from codeblock within column', () => {
      const input = (
        <editor>
          <element type="column_group">
            <element type="column">
              <element type="codeblock">
                <element type="codeline">
                  code
                  <cursor />
                </element>
              </element>
            </element>
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="column_group">
            <element type="column">
              <element type="codeblock">
                <element type="codeline">code</element>
              </element>
              <hp>
                <cursor />
              </hp>
            </element>
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'column_group',
            node: {
              isElement: true,
              isStrictSiblings: false,
              type: 'column_group',
            },
          }),
          createSlatePlugin({
            key: 'column',
            node: { isElement: true, isStrictSiblings: false, type: 'column' },
          }),
          createSlatePlugin({
            key: 'codeblock',
            node: {
              isElement: true,
              isStrictSiblings: false,
              type: 'codeblock',
            },
          }),
          createSlatePlugin({
            key: 'codeline',
            node: { isElement: true, isStrictSiblings: true, type: 'codeline' },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      const result = insertExitBreak(editor);

      expect(editor.children).toEqual(output.children);
      expect(result).toBe(true);
    });

    it('should exit from column to after column_group with level parameter', () => {
      const input = (
        <editor>
          <element type="column_group">
            <element type="column">
              <hp>
                test
                <cursor />
              </hp>
            </element>
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="column_group">
            <element type="column">
              <hp>test</hp>
            </element>
          </element>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'column_group',
            node: {
              isElement: true,
              isStrictSiblings: false,
              type: 'column_group',
            },
          }),
          createSlatePlugin({
            key: 'column',
            node: { isElement: true, isStrictSiblings: true, type: 'column' },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      const result = insertExitBreak(editor); // Exit one level up from column

      expect(editor.children).toEqual(output.children);
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return early if no selection', () => {
      const input = (
        <editor>
          <hp>test</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        value: input.children,
      });

      editor.selection = null;

      const result = insertExitBreak(editor);

      expect(result).toBe(undefined);
    });

    it('should use fallback logic when no non-exitable ancestor found', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>test</hp>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        selection: input.selection,
        value: input.children,
      });

      const result = insertExitBreak(editor);

      expect(editor.children).toEqual(output.children);
      expect(result).toBe(true);
    });
  });
});
