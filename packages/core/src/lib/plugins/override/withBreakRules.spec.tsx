/** @jsx jsxt */

import { BaseH1Plugin } from '@udecode/plate-basic-nodes';
import { BaseListPlugin } from '@udecode/plate-list';
import { jsxt } from '@udecode/plate-test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withBreakRules', () => {
  describe('breakRules: { empty: "reset" }', () => {
    it('should reset on insertBreak when block is empty', () => {
      const input = (
        <editor>
          <element type="blockquote">
            <cursor />
          </element>
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
            key: 'blockquote',
            node: {
              breakRules: { empty: 'reset' },
              isElement: true,
              type: 'blockquote',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should NOT reset on insertBreak when block has content', () => {
      const input = (
        <editor>
          <element type="blockquote">
            some content
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="blockquote">some content</element>
          <element type="blockquote">
            <cursor />
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'blockquote',
            node: {
              breakRules: { empty: 'reset' },
              isElement: true,
              type: 'blockquote',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('breakRules: { empty: "reset" }', () => {
    it('should reset on insertBreak when block is empty', () => {
      const input = (
        <editor>
          <element type="h1">
            <cursor />
          </element>
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
            key: 'h1',
            node: {
              breakRules: { empty: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should NOT reset on insertBreak when block has content', () => {
      const input = (
        <editor>
          <element type="h1">
            Heading content
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="h1">Heading content</element>
          <element type="h1">
            <cursor />
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              breakRules: { empty: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('breakRules: undefined (default)', () => {
    it('should NOT reset on insertBreak when block is empty', () => {
      const input = (
        <editor>
          <element type="custom">
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="custom">
            <htext />
          </element>
          <element type="custom">
            <cursor />
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'custom',
            node: {
              isElement: true,
              type: 'custom',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('property cleanup', () => {
    it('should remove custom properties when resetting', () => {
      const input = (
        <editor>
          <element customProp="value" level={1} type="h1">
            <cursor />
          </element>
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
            key: 'h1',
            node: {
              breakRules: { empty: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('breakRules: { empty: "deleteExit" }', () => {
    it('should NOT delete and exit when block has content', () => {
      const input = (
        <editor>
          <element type="blockquote">
            some content
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="blockquote">some content</element>
          <element type="blockquote">
            <cursor />
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'blockquote',
            node: {
              breakRules: { empty: 'deleteExit' },
              isElement: true,
              type: 'blockquote',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('breakRules: undefined (default)', () => {
    it('should use default behavior when breakRules is undefined', () => {
      const input = (
        <editor>
          <element type="custom">
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="custom">
            <htext />
          </element>
          <element type="custom">
            <cursor />
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'custom',
            node: {
              isElement: true,
              type: 'custom',
              // breakRules is undefined
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should use default behavior when breakRules is empty object', () => {
      const input = (
        <editor>
          <element type="custom">
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="custom">
            <htext />
          </element>
          <element type="custom">
            <cursor />
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'custom',
            node: {
              breakRules: {}, // empty object
              isElement: true,
              type: 'custom',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('matchRules override behavior', () => {
    it('should use matchRules override instead of default plugin breakRules', () => {
      const input = (
        <editor>
          <element customProperty="customValue" type="paragraph">
            <cursor />
          </element>
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
          // Base paragraph plugin with normal break behavior
          createSlatePlugin({
            key: 'paragraph',
            node: {
              breakRules: { empty: 'default' }, // Default behavior
              isElement: true,
              type: 'paragraph',
            },
          }),
          // Override plugin that matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              breakRules: { empty: 'reset' }, // Override behavior
              type: 'override',
              matchRules: ({ node }) => Boolean(node.customProperty),
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should use default behavior when matchRules does not match', () => {
      const input = (
        <editor>
          <element type="paragraph">
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="paragraph">
            <htext />
          </element>
          <element type="paragraph">
            <cursor />
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          // Base paragraph plugin with normal break behavior
          createSlatePlugin({
            key: 'paragraph',
            node: {
              breakRules: { empty: 'default' }, // Default behavior
              isElement: true,
              type: 'paragraph',
            },
          }),
          // Override plugin that only matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              breakRules: { empty: 'reset' }, // Override behavior
              type: 'override',
              matchRules: ({ node }) => Boolean(node.customProperty), // Won't match
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should handle matchRules override for emptyLineEnd scenario', () => {
      const input = (
        <editor>
          <element customProperty="customValue" type="paragraph">
            line1{'\n'}
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element customProperty="customValue" type="paragraph">
            line1{'\n'}
          </element>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'paragraph',
            node: {
              breakRules: { emptyLineEnd: 'default' },
              isElement: true,
              type: 'paragraph',
            },
          }),
          createSlatePlugin({
            key: 'customOverride',
            node: {
              breakRules: { emptyLineEnd: 'exit' },
              type: 'override',
              matchRules: ({ node }) => Boolean(node.customProperty),
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('breakRules: { splitReset: true }', () => {
    it('should reset the new block after splitting', () => {
      const input = (
        <editor>
          <element type="h1">
            Heading <cursor />
            content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="h1">Heading </element>
          <hp>
            <cursor />
            content
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              breakRules: { splitReset: true },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should reset on insertBreak when at the start of the block', () => {
      const input = (
        <editor>
          <element type="h1">
            <cursor />
            Heading content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <htext />
          </hp>
          <element type="h1">
            <cursor />
            Heading content
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              breakRules: { splitReset: true },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should reset on insertBreak when at the end of the block', () => {
      const input = (
        <editor>
          <element type="h1">
            Heading content
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="h1">Heading content</element>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              breakRules: { splitReset: true },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should not reset when a heading is a list item', () => {
      const input = (
        <editor>
          <element indent={1} listStyleType="disc" type="h1">
            Heading
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element indent={1} listStyleType="disc" type="h1">
            Heading
          </element>
          <element indent={1} listStart={2} listStyleType="disc" type="h1">
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [BaseH1Plugin, BaseListPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
