/** @jsx jsxt */

import { BoldPlugin, ItalicPlugin } from '@platejs/basic-nodes/react';
import { BaseLinkPlugin } from '@platejs/link';
import { jsxt } from '@platejs/test-utils';
import { NodeApi, createSlateEditor, createSlatePlugin } from 'platejs';

jsxt;

const createMarkEditor = (input: any) =>
  createSlateEditor({
    plugins: [BoldPlugin, ItalicPlugin],
    selection: input.selection,
    value: input.children,
  });

const createVoidElementPlugin = (key: string) =>
  createSlatePlugin({
    key,
    node: {
      isElement: true,
      isVoid: true,
      type: key,
    },
  });

const voidBoundaryCases = [
  {
    action: (editor: ReturnType<typeof createSlateEditor>) =>
      editor.tf.deleteBackward('character'),
    input: (
      <editor>
        <element type="img">
          <htext />
        </element>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any,
    label: 'selects a previous void block and removes an empty current block',
    output: (
      <editor>
        <element type="img">
          <cursor />
        </element>
      </editor>
    ) as any,
    plugins: [createVoidElementPlugin('img')],
  },
  {
    action: (editor: ReturnType<typeof createSlateEditor>) =>
      editor.tf.deleteBackward('character'),
    input: (
      <editor>
        <element type="img">
          <htext />
        </element>
        <hp>
          <cursor />
          some content
        </hp>
      </editor>
    ) as any,
    label:
      'selects a previous void block without removing non-empty current content',
    output: (
      <editor>
        <element type="img">
          <cursor />
        </element>
        <hp>some content</hp>
      </editor>
    ) as any,
    plugins: [createVoidElementPlugin('img')],
  },
  {
    action: (editor: ReturnType<typeof createSlateEditor>) =>
      editor.tf.deleteBackward('character'),
    input: (
      <editor>
        <hp>previous content</hp>
        <hp>
          <cursor />
          current content
        </hp>
      </editor>
    ) as any,
    label:
      'keeps normal backward delete behavior when the previous block is not void',
    output: (
      <editor>
        <hp>
          previous content
          <cursor />
          current content
        </hp>
      </editor>
    ) as any,
    plugins: [],
  },
  {
    action: (editor: ReturnType<typeof createSlateEditor>) =>
      editor.tf.deleteBackward('character'),
    input: (
      <editor>
        <element type="img">
          <htext />
        </element>
        <hp>
          some
          <cursor />
          content
        </hp>
      </editor>
    ) as any,
    label:
      'does not select the previous void block when the cursor is not at the block start',
    output: (
      <editor>
        <element type="img">
          <htext />
        </element>
        <hp>
          som
          <cursor />
          content
        </hp>
      </editor>
    ) as any,
    plugins: [createVoidElementPlugin('img')],
  },
  {
    action: (editor: ReturnType<typeof createSlateEditor>) =>
      editor.tf.deleteBackward('character'),
    input: (
      <editor>
        <element type="hr">
          <htext />
        </element>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any,
    label: 'selects a previous horizontal rule void block',
    output: (
      <editor>
        <element type="hr">
          <cursor />
        </element>
      </editor>
    ) as any,
    plugins: [createVoidElementPlugin('hr')],
  },
  {
    action: (editor: ReturnType<typeof createSlateEditor>) =>
      editor.tf.deleteForward('character'),
    input: (
      <editor>
        <hp>
          <cursor />
        </hp>
        <element type="hr">
          <htext />
        </element>
      </editor>
    ) as any,
    label:
      'selects a next horizontal rule void block when deleting forward from an empty paragraph',
    output: (
      <editor>
        <element type="hr">
          <cursor />
        </element>
      </editor>
    ) as any,
    plugins: [createVoidElementPlugin('hr')],
  },
  {
    action: (editor: ReturnType<typeof createSlateEditor>) =>
      editor.tf.deleteForward('character'),
    input: (
      <editor>
        <hp>
          text
          <cursor />
        </hp>
        <element type="hr">
          <htext />
        </element>
      </editor>
    ) as any,
    label:
      'selects a next horizontal rule void block without deleting previous text',
    output: (
      <editor>
        <hp>text</hp>
        <element type="hr">
          <cursor />
        </element>
      </editor>
    ) as any,
    plugins: [createVoidElementPlugin('hr')],
  },
];

describe('slate cross-package contracts', () => {
  describe('inline element behavior', () => {
    it('returns sibling nodes after an inline element', () => {
      const input = (
        <editor>
          <hp>
            <htext>first</htext>
            <ha>
              test
              <cursor />
            </ha>
            <htext />
            <htext>last</htext>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [BaseLinkPlugin],
        selection: input.selection,
        value: input.children,
      });

      const [, blockPath] = editor.api.block()!;
      const selectionPath = editor.api
        .path(input.selection!)!
        .slice(blockPath.length);
      const childIndex = selectionPath[0];

      const siblings = Array.from(
        NodeApi.children(editor as any, blockPath, {
          from: childIndex + 1,
        })
      ).map(([node]) => node);

      expect(siblings).toEqual([{ text: '' }, { text: 'last' }]);
    });

    it('returns true when the cursor is at the end of the last inline node', () => {
      const input = (
        <editor>
          <hp>
            <htext>first</htext>
            <ha>
              test
              <cursor />
            </ha>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [BaseLinkPlugin],
        selection: input.selection,
        value: input.children,
      });

      expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(true);
    });

    it('returns false when text follows the last inline node', () => {
      const input = (
        <editor>
          <hp>
            <htext>first</htext>
            <ha>
              test
              <cursor />
            </ha>
            last
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        plugins: [BaseLinkPlugin],
        selection: input.selection,
        value: input.children,
      });

      expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(false);
    });
  });

  describe('toggleMark', () => {
    it('removes the active mark', () => {
      const input = (
        <editor>
          <hp>
            tes
            <htext bold>t</htext>
          </hp>
          <selection>
            <anchor offset={0} path={[0, 1]} />
            <focus offset={1} path={[0, 1]} />
          </selection>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createMarkEditor(input);

      editor.tf.toggleMark(BoldPlugin.key);

      expect(editor.children).toEqual(output.children);
    });

    it('replaces the removed mark with the new mark', () => {
      const input = (
        <editor>
          <hp>
            <htext bold>test</htext>
          </hp>
          <selection>
            <anchor offset={0} path={[0, 0]} />
            <focus offset={4} path={[0, 0]} />
          </selection>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <htext italic>test</htext>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createMarkEditor(input);

      editor.tf.toggleMark(ItalicPlugin.key, { remove: BoldPlugin.key });

      expect(editor.children).toEqual(output.children);
    });

    it('adds the inactive mark', () => {
      const input = (
        <editor>
          <hp>test</hp>
          <selection>
            <anchor offset={3} path={[0, 0]} />
            <focus offset={4} path={[0, 0]} />
          </selection>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            tes
            <htext bold>t</htext>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createMarkEditor(input);

      editor.tf.toggleMark(BoldPlugin.key);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('void boundaries', () => {
    for (const { action, input, label, output, plugins } of voidBoundaryCases) {
      it(label, () => {
        const editor = createSlateEditor({
          plugins,
          selection: input.selection,
          value: input.children,
        });

        action(editor);

        expect(editor.children).toEqual(output.children);
        expect(editor.selection).toEqual(output.selection);
      });
    }
  });
});
