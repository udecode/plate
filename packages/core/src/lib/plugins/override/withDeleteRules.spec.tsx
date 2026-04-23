/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { BaseBlockquotePlugin, BaseH1Plugin } from '@platejs/basic-nodes';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseIndentPlugin } from '@platejs/indent';
import { BaseListPlugin } from '@platejs/list';

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
  describe('generic delete behavior', () => {
    it('deletes an expanded inline paragraph selection in place', () => {
      const input = (
        <editor>
          <hp>
            ab
            <anchor />
            cd
            <focus />
            ef
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            ab
            <cursor />
            ef
          </hp>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteFragment(),
        input,
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('deletes a backward multi-block selection without corrupting the surviving paragraph', () => {
      const input = (
        <editor>
          <hp>
            ab
            <focus />
            cd
          </hp>
          <hp>
            ef
            <anchor />
            gh
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            ab
            <cursor />
            gh
          </hp>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteFragment(),
        input,
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('blockquote structural delete rules', () => {
    it('lifts the current quoted block out of a top-level quote', () => {
      const input = (
        <editor>
          <hblockquote>
            <hp>
              <cursor />
              Quote
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            Quote
          </hp>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('lifts only the current quoted block and keeps quoted siblings wrapped', () => {
      const input = (
        <editor>
          <hblockquote>
            <hp>
              <cursor />
              Lead
            </hp>
            <hp>Tail</hp>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            Lead
          </hp>
          <hblockquote>
            <hp>Tail</hp>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('lets list ownership win for a quoted list item at block start', () => {
      const input = (
        <editor>
          <hblockquote>
            <hp indent={1} listStyleType="disc">
              <cursor />
              Quote
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hblockquote>
            <hp>
              <cursor />
              Quote
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseListPlugin, BaseIndentPlugin, BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('removes the list layer first, then the quote layer on the next delete', () => {
      const input = (
        <editor>
          <hblockquote>
            <hp indent={1} listStyleType="disc">
              <cursor />
              Quote
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            Quote
          </hp>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => {
          editor.tf.deleteBackward('character');
          editor.tf.deleteBackward('character');
        },
        input,
        plugins: [BaseListPlugin, BaseIndentPlugin, BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('deletes an empty non-first quoted paragraph inside the quote before any lift', () => {
      const input = (
        <editor>
          <hblockquote>
            <hp>Lead</hp>
            <hp>
              <cursor />
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hblockquote>
            <hp>
              Lead
              <cursor />
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('still lifts the first empty quoted paragraph out of the quote', () => {
      const input = (
        <editor>
          <hblockquote>
            <hp>
              <cursor />
            </hp>
            <hp>Tail</hp>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
          <hblockquote>
            <hp>Tail</hp>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('lifts a nested quoted paragraph one quote level on delete at block start', () => {
      const input = (
        <editor>
          <hblockquote>
            <hblockquote>
              <hp>
                <cursor />
                Quote
              </hp>
            </hblockquote>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hblockquote>
            <hp>
              <cursor />
              Quote
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('deletes an empty nested quoted paragraph inside the same inner quote before lifting', () => {
      const input = (
        <editor>
          <hblockquote>
            <hblockquote>
              <hp>Lead</hp>
              <hp>
                <cursor />
              </hp>
            </hblockquote>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hblockquote>
            <hblockquote>
              <hp>
                Lead
                <cursor />
              </hp>
            </hblockquote>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('heading structural delete rules', () => {
    it('resets a non-empty heading to a paragraph before merging', () => {
      const input = (
        <editor>
          <hp>Lead</hp>
          <hh1>
            <cursor />
            Heading
          </hh1>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>Lead</hp>
          <hp>
            <cursor />
            Heading
          </hp>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseH1Plugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('deletes an expanded inline heading selection in place', () => {
      const input = (
        <editor>
          <hh1>
            He
            <anchor />
            ad
            <focus />
            ing
          </hh1>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hh1>
            He
            <cursor />
            ing
          </hh1>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteFragment(),
        input,
        plugins: [BaseH1Plugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('deletes a heading-to-paragraph selection without leaving a broken heading boundary', () => {
      const input = (
        <editor>
          <hh1>
            He
            <focus />
            ad
          </hh1>
          <hp>
            ef
            <anchor />
            gh
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hh1>
            He
            <cursor />
            gh
          </hh1>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteFragment(),
        input,
        plugins: [BaseH1Plugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('resets an empty heading to an empty paragraph before any merge', () => {
      const input = (
        <editor>
          <hp>Lead</hp>
          <hh1>
            <cursor />
          </hh1>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>Lead</hp>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseH1Plugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

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
    it('resets a callout block to a paragraph at block start', () => {
      const input = (
        <editor>
          <element type="callout">
            <cursor />
            Callout
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            Callout
          </hp>
        </editor>
      ) as any;

      const editor = getEditorAfterAction({
        action: (editor) => editor.tf.deleteBackward('character'),
        input,
        plugins: [BaseCalloutPlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

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
