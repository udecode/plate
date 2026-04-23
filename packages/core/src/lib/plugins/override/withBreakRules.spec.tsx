/** @jsx jsxt */

import {
  BaseBlockquotePlugin,
  BaseH1Plugin,
  BaseH6Plugin,
} from '@platejs/basic-nodes';
import { BaseCalloutPlugin } from '@platejs/callout';
import { BaseIndentPlugin } from '@platejs/indent';
import { BaseListPlugin } from '@platejs/list';
import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin/createSlatePlugin';

jsxt;

const createElementPlugin = ({
  breakRules,
  key,
  match,
  type = key,
}: {
  breakRules?: Record<string, unknown>;
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
    ...(breakRules || match
      ? {
          rules: {
            ...(breakRules ? { break: breakRules } : {}),
            ...(match ? { match } : {}),
          },
        }
      : {}),
  });

const getInsertBreakEditor = ({
  input,
  plugins,
}: {
  input: any;
  plugins: any[];
}) => {
  const editor = createSlateEditor({
    plugins,
    selection: input.selection,
    value: input.children,
  });

  editor.tf.insertBreak();

  return editor;
};

describe('withBreakRules', () => {
  describe('generic split behavior', () => {
    it('splits a paragraph in the middle', () => {
      const input = (
        <editor>
          <hp>
            abc
            <cursor />
            def
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>abc</hp>
          <hp>
            <cursor />
            def
          </hp>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('keeps generic root split behavior for an empty paragraph', () => {
      const input = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <htext />
          </hp>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('replaces an expanded inline paragraph selection with one split result', () => {
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
          <hp>ab</hp>
          <hp>
            <cursor />
            ef
          </hp>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('replaces an expanded multi-block selection with one split result', () => {
      const input = (
        <editor>
          <hp>
            ab
            <anchor />
            cd
          </hp>
          <hp>
            ef
            <focus />
            gh
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>ab</hp>
          <hp>
            <cursor />
            gh
          </hp>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('blockquote structural exit rules', () => {
    it('lifts an empty top-level quoted paragraph out of the quote', () => {
      const input = (
        <editor>
          <hblockquote>
            <hp>
              <cursor />
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('lifts an empty nested quoted paragraph one quote level', () => {
      const input = (
        <editor>
          <hblockquote>
            <hblockquote>
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
            <hp>
              <cursor />
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('splits a non-empty nested quoted paragraph inside the same inner quote', () => {
      const input = (
        <editor>
          <hblockquote>
            <hblockquote>
              <hp>
                abc
                <cursor />
                def
              </hp>
            </hblockquote>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hblockquote>
            <hblockquote>
              <hp>abc</hp>
              <hp>
                <cursor />
                def
              </hp>
            </hblockquote>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('lets list ownership win for an empty quoted list item', () => {
      const input = (
        <editor>
          <hblockquote>
            <hp indent={1} listStyleType="disc">
              <cursor />
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hblockquote>
            <hp>
              <cursor />
            </hp>
          </hblockquote>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [BaseListPlugin, BaseIndentPlugin, BaseBlockquotePlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('empty reset rules', () => {
    it('resets an empty callout block to a paragraph', () => {
      const input = (
        <editor>
          <element type="callout">
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [BaseCalloutPlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it.each([
      ['blockquote', 'blockquote'],
      ['heading', 'h1'],
    ])('resets an empty %s block to a paragraph', (_label, type) => {
      const input = (
        <editor>
          <element type={type}>
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { empty: 'reset' },
            key: type,
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it.each([
      ['blockquote', 'blockquote', 'some content'],
      ['heading', 'h1', 'Heading content'],
    ])('keeps a non-empty %s block type on insertBreak', (_label, type, text) => {
      const input = (
        <editor>
          <element type={type}>
            {text}
            <cursor />
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type={type}>{text}</element>
          <element type={type}>
            <cursor />
          </element>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { empty: 'reset' },
            key: type,
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { empty: 'reset' },
            key: 'h1',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('line break rules', () => {
    it('keeps Enter inside a non-empty callout by inserting a soft break', () => {
      const input = (
        <editor>
          <element type="callout">
            one
            <cursor />
            two
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="callout">{'one\ntwo'}</element>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [BaseCalloutPlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual({
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });
    });
  });

  describe('deleteExit rules', () => {
    it('keeps a non-empty block when deleteExit only applies to empty blocks', () => {
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { empty: 'deleteExit' },
            key: 'blockquote',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('default break behavior', () => {
    it.each([
      ['without break rules', undefined],
      ['with an empty break rule object', {}],
    ])('uses Slate default behavior %s', (_label, breakRules) => {
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: breakRules as Record<string, unknown> | undefined,
            key: 'custom',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('match overrides', () => {
    it('uses the matching override instead of the base break rule', () => {
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { empty: 'default' },
            key: 'paragraph',
          }),
          createElementPlugin({
            breakRules: { empty: 'reset' },
            key: 'customOverride',
            match: ({ node }: any) => Boolean(node.customProperty),
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('falls back to the base break rule when the override does not match', () => {
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { empty: 'default' },
            key: 'paragraph',
          }),
          createElementPlugin({
            breakRules: { empty: 'reset' },
            key: 'customOverride',
            match: ({ node }: any) => Boolean(node.customProperty),
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('uses the matching override for emptyLineEnd rules', () => {
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { emptyLineEnd: 'default' },
            key: 'paragraph',
          }),
          createElementPlugin({
            breakRules: { emptyLineEnd: 'exit' },
            key: 'customOverride',
            match: ({ node }: any) => Boolean(node.customProperty),
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });

  describe('split reset rules', () => {
    it('resets the new block after splitting in the middle', () => {
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { splitReset: true },
            key: 'h1',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('replaces an expanded heading selection and resets the trailing block', () => {
      const input = (
        <editor>
          <element type="h1">
            He
            <anchor />
            ad
            <focus />
            ing
          </element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="h1">He</element>
          <hp>
            <cursor />
            ing
          </hp>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { splitReset: true },
            key: 'h1',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('resets the new block when breaking at the start', () => {
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { splitReset: true },
            key: 'h1',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('resets the new block when breaking at the end', () => {
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

      const editor = getInsertBreakEditor({
        input,
        plugins: [
          createElementPlugin({
            breakRules: { splitReset: true },
            key: 'h1',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('does not reset a heading list item', () => {
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
          <element indent={1} listStyleType="disc" type="h1">
            <cursor />
            content
          </element>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [BaseH1Plugin, BaseListPlugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });

    it('resets the new block after splitting in the middle of an h6 heading', () => {
      const input = (
        <editor>
          <hh6>
            Heading <cursor />
            content
          </hh6>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hh6>Heading </hh6>
          <hp>
            <cursor />
            content
          </hp>
        </editor>
      ) as any;

      const editor = getInsertBreakEditor({
        input,
        plugins: [BaseH6Plugin],
      });

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});
