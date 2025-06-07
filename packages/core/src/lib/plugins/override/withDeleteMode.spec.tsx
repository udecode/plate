/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withDeleteMode', () => {
  describe('deleteMode: { empty: "reset" }', () => {
    it('should reset on deleteBackward when block is empty', () => {
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
              deleteMode: { empty: 'reset' },
              isElement: true,
              type: 'blockquote',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should NOT reset on deleteBackward when at start with content', () => {
      const input = (
        <editor>
          <hp>
            <htext />
          </hp>
          <hblockquote>
            <cursor />
            some content
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hblockquote>
            <cursor />
            some content
          </hblockquote>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'blockquote',
            node: {
              deleteMode: { empty: 'reset' },
              isElement: true,
              type: 'blockquote',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('deleteMode: { start: "reset" }', () => {
    it('should reset on deleteBackward when at start with content', () => {
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
            <cursor />
            Heading content
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              deleteMode: { start: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should reset on deleteBackward when block is empty', () => {
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
              deleteMode: { start: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should NOT reset when not at start and has content', () => {
      const input = (
        <editor>
          <element type="h1">
            Head
            <cursor />
            ing
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="h1">
            Hea
            <cursor />
            ing
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'h1',
            node: {
              deleteMode: { start: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('deleteMode: undefined (default)', () => {
    it('should NOT reset on deleteBackward when at start', () => {
      const input = (
        <editor>
          <hp>
            <htext />
          </hp>
          <element type="custom">
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="custom">
            <cursor />
            content
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

      editor.tf.deleteBackward('character');

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
              deleteMode: { start: 'reset' },
              isElement: true,
              type: 'h1',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('default reset behavior', () => {
    describe('when delete from start to end of editor', () => {
      it('should reset editor to default paragraph', () => {
        const input = (
          <editor>
            <hp test="test">
              <anchor />
              test
            </hp>
            <hp>
              test
              <focus />
            </hp>
          </editor>
        ) as any;

        const output = (
          <editor>
            <hp>
              <htext />
              <cursor />
            </hp>
          </editor>
        ) as any;

        const editor = createSlateEditor({
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteFragment();

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when delete from end to start of editor', () => {
      it('should reset editor to default paragraph', () => {
        const input = (
          <editor>
            <hp test="test">
              <focus />
              test
            </hp>
            <hp>
              test
              <anchor />
            </hp>
          </editor>
        ) as any;

        const output = (
          <editor>
            <hp>
              <htext />
              <cursor />
            </hp>
          </editor>
        ) as any;

        const editor = createSlateEditor({
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteFragment();

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when delete at first block start', () => {
      it('should reset first block to default paragraph', () => {
        const input = (
          <editor>
            <hh1 test="test">
              <cursor />
              test
            </hh1>
          </editor>
        ) as any;

        const output = (
          <editor>
            <hp>
              <cursor />
              test
            </hp>
          </editor>
        ) as any;

        const editor = createSlateEditor({
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteBackward('character');

        expect(editor.children).toEqual(output.children);
      });
    });
  });

  describe('deleteMode: undefined (default)', () => {
    it('should use default behavior when deleteMode is undefined', () => {
      const input = (
        <editor>
          <hp>
            <htext />
          </hp>
          <element type="custom">
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="custom">
            <cursor />
            content
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
              // deleteMode is undefined
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should use default behavior when deleteMode is empty object', () => {
      const input = (
        <editor>
          <hp>
            <htext />
          </hp>
          <element type="custom">
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="custom">
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'custom',
            node: {
              deleteMode: {}, // empty object
              isElement: true,
              type: 'custom',
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('matchMode override behavior', () => {
    it('should use matchMode override instead of default plugin deleteMode for start scenario', () => {
      const input = (
        <editor>
          <element customProperty="customValue" type="paragraph">
            <cursor />
            some content
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            some content
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          // Base paragraph plugin with no delete behavior
          createSlatePlugin({
            key: 'paragraph',
            node: {
              deleteMode: { start: 'default' }, // Default behavior
              isElement: true,
              type: 'paragraph',
            },
          }),
          // Override plugin that matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              deleteMode: { start: 'reset' }, // Override behavior
              type: 'override',
              matchMode: ({ node }) => Boolean(node.customProperty),
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should use default behavior when matchMode does not match', () => {
      const input = (
        <editor>
          <hp>
            <htext />
          </hp>
          <hp>
            <cursor />
            some content
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            some content
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [
          // Base paragraph plugin with no delete behavior
          createSlatePlugin({
            key: 'p',
            node: {
              deleteMode: { start: 'default' }, // Default behavior
              isElement: true,
              type: 'p',
            },
          }),
          // Override plugin that only matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              deleteMode: { start: 'reset' }, // Override behavior
              type: 'override',
              matchMode: ({ node }) => Boolean(node.customProperty), // Won't match
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('should handle matchMode override for empty scenario', () => {
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
          createSlatePlugin({
            key: 'paragraph',
            node: {
              deleteMode: { empty: 'default' },
              isElement: true,
              type: 'paragraph',
            },
          }),
          createSlatePlugin({
            key: 'customOverride',
            node: {
              deleteMode: { empty: 'reset' },
              type: 'override',
              matchMode: ({ node }) => Boolean(node.customProperty),
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward('character');

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
