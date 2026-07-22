/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import { BaseParagraphPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseListPlugin } from '../BaseListPlugin';

jsxt;

describe('withInsertBreakList', () => {
  it('insert a new todo list line with the same formatting', () => {
    const input = (
      <editor>
        <hp checked={false} indent={1} listStyleType={KEYS.listTodo}>
          Todo item
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp checked={false} indent={1} listStyleType={KEYS.listTodo}>
          Todo item
        </hp>
        <hp
          checked={false}
          indent={1}
          listStart={2}
          listStyleType={KEYS.listTodo}
        >
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('behave like a normal break if not a todo line', () => {
    const input = (
      <editor>
        <hp indent={1} listStyleType="disc">
          Disc item
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp indent={1} listStyleType="disc">
          Disc item
        </hp>
        <hp indent={1} listStyleType="disc">
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('behave like a normal break if selection is expanded', () => {
    const input = (
      <editor>
        <hp checked={false} indent={1} listStyleType={KEYS.listTodo}>
          Todo <anchor />
          item
          <focus />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp checked={false} indent={1} listStyleType={KEYS.listTodo}>
          Todo <cursor />
        </hp>
        <hp
          checked={false}
          indent={1}
          listStart={2}
          listStyleType={KEYS.listTodo}
        >
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin, BaseListPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(output.children);
  });
});
