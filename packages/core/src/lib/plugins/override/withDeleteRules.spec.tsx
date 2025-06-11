/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

describe('withDeleteRules', () => {
  describe('rules: { delete: { empty: "reset" }', () => {
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
              isElement: true,
              type: 'blockquote',
            },
            rules: { delete: { empty: 'reset' } },
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
              isElement: true,
              type: 'blockquote',
            },
            rules: { delete: { empty: 'reset' } },
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

  describe('rules: { delete: { start: "reset" }', () => {
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
              isElement: true,
              type: 'h1',
            },
            rules: { delete: { start: 'reset' } },
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
              isElement: true,
              type: 'h1',
            },
            rules: { delete: { start: 'reset' } },
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
              isElement: true,
              type: 'h1',
            },
            rules: { delete: { start: 'reset' } },
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

  describe('rules: { delete: undefined (default)', () => {
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
              isElement: true,
              type: 'h1',
            },
            rules: { delete: { start: 'reset' } },
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

  describe('rules: { delete: undefined (default)', () => {
    it('should use default behavior when deleteRules is undefined', () => {
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
              // deleteRules is undefined
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

    it('should use default behavior when deleteRules is empty object', () => {
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
            rules: { delete: {} }, // empty object
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

  describe('matchRules override behavior', () => {
    it('should use matchRules override instead of default plugin deleteRules for start scenario', () => {
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
              isElement: true,
              type: 'paragraph',
            },
            rules: { delete: { start: 'default' } }, // Default behavior
          }),
          // Override plugin that matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              delete: { start: 'reset' }, // Override behavior
              match: ({ node }: { node: any }) => Boolean(node.customProperty),
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

    it('should use default behavior when matchRules does not match', () => {
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
              isElement: true,
              type: 'p',
            },
            rules: { delete: { start: 'default' } }, // Default behavior
          }),
          // Override plugin that only matches nodes with customProperty
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              delete: { start: 'reset' }, // Override behavior
              match: ({ node }: { node: any }) => Boolean(node.customProperty), // Won't match
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

    it('should handle matchRules override for empty scenario', () => {
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
              isElement: true,
              type: 'paragraph',
            },
            rules: { delete: { empty: 'default' } },
          }),
          createSlatePlugin({
            key: 'customOverride',
            node: {
              type: 'override',
            },
            rules: {
              delete: { empty: 'reset' },
              match: ({ node }: { node: any }) => Boolean(node.customProperty),
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
