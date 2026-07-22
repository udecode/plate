/** @jsx jsxt */

import { BoldPlugin, ItalicPlugin } from '@platejs/basic-nodes/react';
import { BaseLinkPlugin } from '@platejs/link';
import { jsxt } from '@platejs/test-utils';
import { NodeApi, createBaseEditor, createBasePlugin } from 'platejs';

jsxt;

const createMarkEditor = (input: any) =>
  createBaseEditor({
    plugins: [BoldPlugin, ItalicPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

const createVoidElementPlugin = (key: string) =>
  createBasePlugin({
    key,
    schema: { element: { void: 'block' } },
    type: key,
  });

const deleteBackwardCharacter = (
  editor: ReturnType<typeof createBaseEditor>
) => {
  editor.update.text.deleteBackward({ unit: 'character' });
};

const deleteForwardCharacter = (
  editor: ReturnType<typeof createBaseEditor>
) => {
  editor.update.text.deleteForward({ unit: 'character' });
};

const toggleMark = (
  editor: ReturnType<typeof createBaseEditor>,
  key: string,
  options: { remove?: string } = {}
) => {
  editor.update((tx) => {
    if (options.remove) {
      tx.marks.remove(options.remove);
    }
    tx.marks.toggle(key);
  });
};

const isTrailingTextEmpty = (editor: ReturnType<typeof createBaseEditor>) =>
  editor.read((state) => {
    const selection = state.selection();
    if (!selection) return true;

    const blockEntry = state.nodes.block();
    if (!blockEntry) return true;

    const [, blockPath] = blockEntry;
    const blockEnd = state.points.end(blockPath);

    if (!blockEnd) return true;

    return (
      state.text.string({
        kind: 'text',
        anchor: selection.focus,
        focus: blockEnd,
      }) === ''
    );
  });

const voidBoundaryCases = [
  {
    action: deleteBackwardCharacter,
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
    action: deleteBackwardCharacter,
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
    action: deleteBackwardCharacter,
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
    action: deleteBackwardCharacter,
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
    action: deleteBackwardCharacter,
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
    action: deleteForwardCharacter,
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
    action: deleteForwardCharacter,
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

      const editor = createBaseEditor({
        plugins: [BaseLinkPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      const [, blockPath] = editor.read.nodes.block()!;
      const selectionPath = editor.read.nodes.path(input.selection!);

      if (!selectionPath) {
        throw new Error('Expected the inline selection to resolve to a path');
      }

      const childIndex = selectionPath[blockPath.length];

      if (childIndex === undefined) {
        throw new Error('Expected the inline selection to resolve to a child');
      }

      const siblings = Array.from(NodeApi.children(editor as any, blockPath))
        .slice(childIndex + 1)
        .map(([node]) => node);

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

      const editor = createBaseEditor({
        plugins: [BaseLinkPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      expect(isTrailingTextEmpty(editor)).toBe(true);
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

      const editor = createBaseEditor({
        plugins: [BaseLinkPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      expect(isTrailingTextEmpty(editor)).toBe(false);
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

      toggleMark(editor, BoldPlugin.key);

      expect(editor.read.children()).toEqual(output.children);
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

      toggleMark(editor, ItalicPlugin.key, { remove: BoldPlugin.key });

      expect(editor.read.children()).toEqual(output.children);
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

      toggleMark(editor, BoldPlugin.key);

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('void boundaries', () => {
    for (const { action, input, label, output, plugins } of voidBoundaryCases) {
      it(label, () => {
        const editor = createBaseEditor({
          plugins,
          selection: input.selection,
          initialValue: input.children,
        });

        action(editor);

        expect(editor.read.children()).toEqual(output.children);
        expect(editor.read.selection()).toEqual(output.selection);
      });
    }
  });
});
