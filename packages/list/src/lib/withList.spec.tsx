/** @jsx jsxt */

import { createBaseEditor, createBasePlugin } from '@platejs/core';

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const InlinePlugin = createBasePlugin({
  key: 'inline',
  node: { isElement: true, isInline: true },
});

describe('normalizeList', () => {
  describe('when listStyleType without indent', () => {
    it('remove listStyleType and listStart props', async () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            <cursor />
          </hp>
          <hp indent={1} listStart={3} listStyleType="decimal">
            1
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp>
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when deleting backward on empty paragraph between two lists', () => {
    it('merge and renumber the lists', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            4
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp indent={1} listStart={3} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={4} listStyleType="decimal">
            4
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when deleting forward on empty paragraph between two lists', () => {
    it('merge and renumber the lists', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hp indent={1} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            4
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="decimal">
            1
          </hp>
          <hp indent={1} listStart={2} listStyleType="decimal">
            2
          </hp>
          <hp indent={1} listStart={3} listStyleType="decimal">
            3
          </hp>
          <hp indent={1} listStart={4} listStyleType="decimal">
            4
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.update.text.deleteForward();

      expect(editor.read.children()).toEqual(output.children);
    });
  });
});

describe('keyboard handling', () => {
  describe('when Enter on root list and empty', () => {
    it('exits the list to a plain paragraph', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(output.selection);
    });
  });

  describe('when Enter on indented list and empty', () => {
    it('outdent', () => {
      const input = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('uses the active transaction selection', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        value: [
          {
            children: [{ text: '' }],
            indent: 2,
            listStyleType: 'disc',
            type: 'p',
          },
        ],
      });

      editor.update((tx) => {
        tx.selection.set({ offset: 0, path: [0, 0] });
        tx.break.insert();
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: '' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ]);
    });
  });

  describe('when Enter on indented and empty but not list', () => {
    it('does not outdent', () => {
      const input = (
        <editor>
          <hp indent={2}>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp indent={2}>
            <htext />
          </hp>
          <hp indent={2}>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when Backspace at start of a root list item', () => {
    it('removes the list layer before touching content', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
            One
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });
  });

  describe('when Backspace at start of an indented list item', () => {
    it('outdents one level', () => {
      const input = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });

    it('outdents when the cursor starts inside an inline', () => {
      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin, InlinePlugin],
        selection: {
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0] },
        },
        value: [
          {
            children: [
              {
                children: [{ text: 'One' }],
                type: 'inline',
              },
            ],
            indent: 2,
            listStyleType: 'disc',
            type: 'p',
          },
        ],
      });

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual([
        {
          children: [
            {
              children: [{ text: 'One' }],
              type: 'inline',
            },
          ],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ]);
    });
  });

  describe('when tabbing list items', () => {
    it('indents a list item one level on Tab', () => {
      const input = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      expect(editor.update.indent.tab()).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(output.selection);
    });

    it('outdents a nested list item one level on Shift+Tab', () => {
      const input = (
        <editor>
          <hp indent={2} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp indent={1} listStyleType="disc">
            <cursor />
            One
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      expect(editor.update.indent.untab()).toBe(true);
      expect(editor.read.children()).toEqual(output.children);
      expect(editor.read.selection()).toEqual(output.selection);
    });
  });
});

describe('apply override', () => {
  it('coerces lower-roman inserts to lower-alpha when the previous sibling is alpha', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin, BaseIndentPlugin],
      value: [
        {
          children: [{ text: 'a' }],
          indent: 1,
          listStyleType: 'lower-alpha',
          type: 'p',
        },
      ],
    } as any);

    editor.update.nodes.insert({
      children: [{ text: 'i' }],
      indent: 1,
      listStyleType: 'lower-roman',
      type: 'p',
    } as any);

    expect((editor.read.children()[1] as any).listStyleType).toBe(
      'lower-alpha'
    );
  });

  it('drops list restart props from split list items', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin, BaseIndentPlugin],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      value: [
        {
          children: [{ text: '12' }],
          indent: 1,
          listRestart: 5,
          listRestartPolite: true,
          listStyleType: 'decimal',
          type: 'p',
        },
      ],
    } as any);

    editor.update.nodes.split({ always: true });

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: '1' }],
        indent: 1,
        listRestart: 5,
        listRestartPolite: true,
        listStart: 5,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: '2' }],
        indent: 1,
        listStart: 6,
        listStyleType: 'decimal',
        type: 'p',
      },
    ]);
  });
});
