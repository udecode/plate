/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const createListEditor = (input: TestEditor) =>
  createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

describe('withInsertBreakList', () => {
  it('moves an empty list item up and exits the list', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <cursor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;
    const expected = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createListEditor(input);

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(expected.children);
    expect(editor.read.selection()).toEqual(expected.selection!);
  });

  it('inserts a sibling list item for non-empty content', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              one
              <cursor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;
    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
          </hli>
          <hli>
            <hlic>
              <cursor />
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as TestEditor;

    const editor = createListEditor(input);

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(expected.children);
    expect(editor.read.selection()).toEqual(expected.selection!);
  });

  it('falls back to normal insertBreak outside lists', () => {
    const input = (
      <editor>
        <hp>
          o<cursor />
          ne
        </hp>
      </editor>
    ) as TestEditor;
    const expected = (
      <editor>
        <hp>o</hp>
        <hp>
          <cursor />
          ne
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createListEditor(input);

    editor.update.break.insert();

    expect(editor.read.children()).toEqual(expected.children);
    expect(editor.read.selection()).toEqual(expected.selection!);
  });
});
