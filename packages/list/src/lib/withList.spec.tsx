/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

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
      ) as any as SlateEditor;

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
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.tf.deleteBackward();

      expect(editor.children).toEqual(output.children);
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
      ) as any as SlateEditor;

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
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.tf.deleteBackward();

      expect(editor.children).toEqual(output.children);
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
      ) as any as SlateEditor;

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
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        shouldNormalizeEditor: true,
        value: input.children,
      });

      editor.tf.deleteForward();

      expect(editor.children).toEqual(output.children);
    });
  });
});

describe('keyboard handling', () => {
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

      const editor = createSlateEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
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

      const editor = createSlateEditor({
        plugins: [BaseListPlugin, BaseIndentPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
    });
  });
});

describe('apply override', () => {
  it('coerces lower-roman inserts to lower-alpha when the previous sibling is alpha', () => {
    const editor = createSlateEditor({
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

    editor.tf.insertNodes({
      children: [{ text: 'i' }],
      indent: 1,
      listStyleType: 'lower-roman',
      type: 'p',
    } as any);

    expect((editor.children[1] as any).listStyleType).toBe('lower-alpha');
  });

  it('drops list restart props from split list items', () => {
    const editor = createSlateEditor({
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

    editor.tf.splitNodes({ always: true });

    expect(editor.children).toEqual([
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
