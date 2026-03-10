/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

const createElementPlugin = ({
  deleteRules,
  key,
  match,
  type = key,
}: {
  deleteRules?: Record<string, unknown>;
  key: string;
  match?: ({ node }: any) => boolean;
  type?: string;
}) =>
  createSlatePlugin({
    key,
    node: {
      isElement: true,
      type,
    },
    ...(deleteRules || match
      ? {
          rules: {
            ...(deleteRules ? { delete: deleteRules } : {}),
            ...(match ? { match } : {}),
          },
        }
      : {}),
  });

const getEditorAfterAction = ({
  action,
  input,
  plugins = [],
}: {
  action: (editor: ReturnType<typeof createSlateEditor>) => void;
  input: any;
  plugins?: any[];
}) => {
  const editor = createSlateEditor({
    plugins,
    selection: input.selection,
    value: input.children,
  });

  action(editor);

  return editor;
};

describe('withDeleteRules', () => {
  describe('empty reset rules', () => {
    it('resets an empty block on deleteBackward', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: { empty: 'reset' },
            key: 'blockquote',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('does not reset a non-empty block when only empty reset is configured', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: { empty: 'reset' },
            key: 'blockquote',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('start reset rules', () => {
    it.each([
      [
        'resets a non-empty heading at the start',
        (
          <editor>
            <element type="h1">
              <cursor />
              Heading content
            </element>
          </editor>
        ) as any,
        (
          <editor>
            <hp>
              <cursor />
              Heading content
            </hp>
          </editor>
        ) as any,
      ],
      [
        'resets an empty heading at the start',
        (
          <editor>
            <element type="h1">
              <cursor />
            </element>
          </editor>
        ) as any,
        (
          <editor>
            <hp>
              <cursor />
            </hp>
          </editor>
        ) as any,
      ],
    ])('%s', (_label, input, output) => {
      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: { start: 'reset' },
            key: 'h1',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('keeps the block type when deleting away from the start', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: { start: 'reset' },
            key: 'h1',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('property cleanup', () => {
    it('removes custom properties when resetting', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: { start: 'reset' },
            key: 'h1',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('default editor reset behavior', () => {
    it.each([
      [
        'resets the editor after deleting a forward fragment across the full document',
        (
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
        ) as any,
      ],
      [
        'resets the editor after deleting a backward fragment across the full document',
        (
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
        ) as any,
      ],
    ])('%s', (_label, input) => {
      const output = (
        <editor>
          <hp>
            <htext />
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteFragment(),
        input,
      });

      expect(editor.children).toEqual(output.children);
    });

    it('resets the first block to a paragraph when deleting at editor start', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
      });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('default delete behavior', () => {
    it.each([
      ['without delete rules', undefined],
      ['with an empty delete rule object', {}],
    ])('%s keeps Slate default delete behavior', (_label, deleteRules) => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: deleteRules as Record<string, unknown> | undefined,
            key: 'custom',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('match overrides', () => {
    it('uses the matching override for start reset behavior', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: { start: 'default' },
            key: 'paragraph',
          }),
          createElementPlugin({
            deleteRules: { start: 'reset' },
            key: 'customOverride',
            match: ({ node }: { node: any }) => Boolean(node.customProperty),
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('falls back to the base delete behavior when the override does not match', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: { start: 'default' },
            key: 'p',
          }),
          createElementPlugin({
            deleteRules: { start: 'reset' },
            key: 'customOverride',
            match: ({ node }: { node: any }) => Boolean(node.customProperty),
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('uses the matching override for empty reset behavior', () => {
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

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [
          createElementPlugin({
            deleteRules: { empty: 'default' },
            key: 'paragraph',
          }),
          createElementPlugin({
            deleteRules: { empty: 'reset' },
            key: 'customOverride',
            match: ({ node }: { node: any }) => Boolean(node.customProperty),
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
