/** @jsx jsxt */

import { BaseH1Plugin } from '@platejs/basic-nodes';
import { BaseListPlugin } from '@platejs/list';
import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withBreakRules', () => {
  describe('rules: { break: { empty: "reset" }', () => {
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
              isElement: true,
              type: 'blockquote',
            },
            rules: {
              break: { empty: 'reset' },
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
              isElement: true,
              type: 'blockquote',
            },
            rules: {
              break: { empty: 'reset' },
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

  describe('rules: { break: { empty: "reset" }', () => {
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
              isElement: true,
              type: 'h1',
            },
            rules: {
              break: { empty: 'reset' },
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
              isElement: true,
              type: 'h1',
            },
            rules: {
              break: { empty: 'reset' },
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

  describe('rules: { break: undefined (default)', () => {
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
              isElement: true,
              type: 'h1',
            },
            rules: {
              break: { empty: 'reset' },
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

  describe('rules: { break: { empty: "deleteExit" }', () => {
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
              isElement: true,
              type: 'blockquote',
            },
            rules: {
              break: { empty: 'deleteExit' },
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

  describe('rules: { break: undefined (default)', () => {
    it('should use default behavior when rules.break is undefined', () => {
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
              // rules.break is undefined
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

    it('should use default behavior when rules.break is empty object', () => {
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
            rules: {
              break: {}, // empty object
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
    it('should use matchRules override instead of default plugin rules.break', () => {
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
              isElement: true,
              type: 'paragraph',
            },
            rules: {
              break: { empty: 'default' }, // Default behavior
            },
          }),
          // Override plugin that matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              break: { empty: 'reset' }, // Override behavior
              match: ({ node }: any) => Boolean(node.customProperty),
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
              isElement: true,
              type: 'paragraph',
            },
            rules: {
              break: { empty: 'default' }, // Default behavior
            },
          }),
          // Override plugin that only matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              break: { empty: 'reset' }, // Override behavior
              match: ({ node }: any) => Boolean(node.customProperty), // Won't match
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
              isElement: true,
              type: 'paragraph',
            },
            rules: {
              break: { emptyLineEnd: 'default' },
            },
          }),
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              break: { emptyLineEnd: 'exit' },
              match: ({ node }: any) => Boolean(node.customProperty),
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

  describe('rules: { break: { splitReset: true }', () => {
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
              isElement: true,
              type: 'h1',
            },
            rules: {
              break: { splitReset: true },
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
              isElement: true,
              type: 'h1',
            },
            rules: {
              break: { splitReset: true },
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
              isElement: true,
              type: 'h1',
            },
            rules: {
              break: { splitReset: true },
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
