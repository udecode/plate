/** @jsx jsxt */

import { type SlateEditor, BaseParagraphPlugin } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';

jsxt;

describe('withInsertBreakIndentList', () => {
  it('should insert a new todo list line with the same formatting', () => {
    const input = (
      <editor>
        <hp checked={false} indent={1} listStyleType={INDENT_LIST_KEYS.todo}>
          Todo item
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp checked={false} indent={1} listStyleType={INDENT_LIST_KEYS.todo}>
          Todo item
        </hp>
        <hp
          checked={false}
          indent={1}
          listStart={2}
          listStyleType={INDENT_LIST_KEYS.todo}
        >
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [BaseParagraphPlugin, IndentPlugin, BaseIndentListPlugin],
    });

    editor.insertBreak();

    expect(editor.children).toEqual(output.children);
  });

  it('should behave like a normal break if not a todo line', () => {
    const input = (
      <editor>
        <hp indent={1} listStyleType="disc">
          Disc item
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp indent={1} listStyleType="disc">
          Disc item
        </hp>
        <hp indent={1} listStart={2} listStyleType="disc">
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [BaseParagraphPlugin, IndentPlugin, BaseIndentListPlugin],
    });

    editor.insertBreak();

    expect(editor.children).toEqual(output.children);
  });

  it('should behave like a normal break if selection is expanded', () => {
    const input = (
      <editor>
        <hp checked={false} indent={1} listStyleType={INDENT_LIST_KEYS.todo}>
          Todo <anchor />
          item
          <focus />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp checked={false} indent={1} listStyleType={INDENT_LIST_KEYS.todo}>
          Todo <cursor />
        </hp>
        <hp
          checked={false}
          indent={1}
          listStart={2}
          listStyleType={INDENT_LIST_KEYS.todo}
        >
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [BaseParagraphPlugin, IndentPlugin, BaseIndentListPlugin],
    });

    editor.insertBreak();

    expect(editor.children).toEqual(output.children);
  });
});
