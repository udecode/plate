/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withBreakMode', () => {
  describe('breakMode: { empty: "reset" }', () => {
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
              breakMode: { empty: 'reset' },
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
              breakMode: { empty: 'reset' },
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

  describe('breakMode: { empty: "reset" } (equivalent to old resetMode: "start")', () => {
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
              breakMode: { empty: 'reset' },
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
              breakMode: { empty: 'reset' },
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

  describe('breakMode: undefined (default)', () => {
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
              breakMode: { empty: 'reset' },
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

  describe('breakMode: { empty: "deleteExit" }', () => {
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
              breakMode: { empty: 'deleteExit' },
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

  describe('breakMode: undefined (default)', () => {
    it('should use default behavior when breakMode is undefined', () => {
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
              // breakMode is undefined
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

    it('should use default behavior when breakMode is empty object', () => {
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
              breakMode: {}, // empty object
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

  describe('matchMode override behavior', () => {
    it('should use matchMode override instead of default plugin breakMode', () => {
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
              breakMode: { empty: 'default' }, // Default behavior
              isElement: true,
              type: 'paragraph',
            },
          }),
          // Override plugin that matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              breakMode: { empty: 'reset' }, // Override behavior
              type: 'override',
              matchMode: ({ node }) => Boolean(node.customProperty),
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

    it('should use default behavior when matchMode does not match', () => {
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
              breakMode: { empty: 'default' }, // Default behavior
              isElement: true,
              type: 'paragraph',
            },
          }),
          // Override plugin that only matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              breakMode: { empty: 'reset' }, // Override behavior
              type: 'override',
              matchMode: ({ node }) => Boolean(node.customProperty), // Won't match
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

    it('should handle matchMode override for emptyLineEnd scenario', () => {
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
              breakMode: { emptyLineEnd: 'default' },
              isElement: true,
              type: 'paragraph',
            },
          }),
          createSlatePlugin({
            key: 'customOverride',
            node: {
              breakMode: { emptyLineEnd: 'exit' },
              type: 'override',
              matchMode: ({ node }) => Boolean(node.customProperty),
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
});
