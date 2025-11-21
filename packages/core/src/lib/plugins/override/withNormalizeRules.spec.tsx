/** @jsx jsxt */
import { describe, expect, test as it } from 'bun:test';

import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withNormalizeRules', () => {
  describe('rules: { normalize: { removeEmpty: true }', () => {
    it('should remove empty element on normalize', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <htext />
            </element>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'link',
            node: {
              isElement: true,
            },
            rules: {
              normalize: { removeEmpty: true },
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
    });

    it('should NOT remove element with content on normalize', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              Link text
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              Link text
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'link',
            node: {
              isElement: true,
              type: 'link',
            },
            rules: {
              normalize: { removeEmpty: true },
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('rules: { normalize: undefined (default)', () => {
    it('should NOT remove empty element when rules.normalize is undefined', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <htext />
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <htext />
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'link',
            node: {
              isElement: true,
              type: 'link',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
    });

    it('should NOT remove empty element when removeEmpty is false', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'link',
            node: {
              isElement: true,
              type: 'link',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('matchRules override behavior', () => {
    it('should use matchRules override instead of default plugin rules.normalize', () => {
      const input = (
        <editor>
          <hp>
            <element customProperty="customValue" type="paragraph">
              <htext />
            </element>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          // Base paragraph plugin with no normalize mode
          createSlatePlugin({
            key: 'paragraph',
            node: {
              isElement: true,
              type: 'paragraph',
              // rules.normalize is undefined
            },
          }),
          // Override plugin that matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              normalize: { removeEmpty: true }, // Override behavior
              match: ({ node }) => Boolean(node.customProperty) as any,
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
    });

    it('should use default behavior when matchRules does not match', () => {
      const input = (
        <editor>
          <hp>
            <element type="paragraph">
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <element type="paragraph">
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          // Base paragraph plugin with no normalize mode
          createSlatePlugin({
            key: 'paragraph',
            node: {
              isElement: true,
              type: 'paragraph',
              // rules.normalize is undefined
            },
          }),
          // Override plugin that only matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              normalize: { removeEmpty: true }, // Override behavior
              match: ({ node }) => Boolean(node.customProperty) as any, // Won't match
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('multiple empty elements', () => {
    it('should remove multiple empty elements with same type', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <htext />
            </element>
            <element type="link" url="http://example.com">
              <htext />
            </element>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'link',
            node: {
              isElement: true,
              type: 'link',
            },
            rules: {
              normalize: { removeEmpty: true },
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      // Normalize first link
      editor.tf.normalize({ force: true });

      // Normalize second link (now at index 0 after first removal)
      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('nested empty elements', () => {
    it('should remove empty nested elements', () => {
      const input = (
        <editor>
          <hp>
            <element type="blockquote">
              <element type="paragraph">
                <htext />
              </element>
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <element type="blockquote">
              <htext />
            </element>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'blockquote',
            node: {
              isElement: true,
              type: 'blockquote',
            },
          }),
          createSlatePlugin({
            key: 'paragraph',
            node: {
              isElement: true,
              type: 'paragraph',
            },
            rules: {
              normalize: { removeEmpty: true },
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      // Normalize the nested paragraph
      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
    });
  });
});
