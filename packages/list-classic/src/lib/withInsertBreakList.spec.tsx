/** @jsx jsxt */

import type { SlateEditor } from '@platejs/core';
import { createListClassicRuntimeTestEditor as createSlateEditor } from './__tests__/createListClassicRuntimeTestEditor';

import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const createListEditor = (input: SlateEditor) =>
  createSlateEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

describe('ListClassicExtension insertBreak', () => {
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
    ) as any as SlateEditor;
    const expected = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createListEditor(input);

    editor.update((tx) => tx.break.insert());

    expect(editor.children).toEqual(expected.children);
    expect(editor.selection).toEqual(expected.selection);
  });

  it('resets an orphan empty list item into a paragraph', () => {
    const input = (
      <editor>
        <hli>
          <hlic>
            <cursor />
          </hlic>
        </hli>
      </editor>
    ) as any as SlateEditor;
    const expected = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createListEditor(input);

    editor.update((tx) => tx.break.insert());

    expect(editor.children).toEqual(expected.children);
    expect(editor.selection).toEqual(expected.selection);
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
    ) as any as SlateEditor;
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
    ) as any as SlateEditor;

    const editor = createListEditor(input);

    editor.update((tx) => tx.break.insert());

    expect(editor.children).toEqual(expected.children);
    expect(editor.selection).toEqual(expected.selection);
  });

  it('falls back to normal insertBreak outside lists', () => {
    const input = (
      <editor>
        <hp>
          o<cursor />
          ne
        </hp>
      </editor>
    ) as any as SlateEditor;
    const expected = (
      <editor>
        <hp>o</hp>
        <hp>
          <cursor />
          ne
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createListEditor(input);

    editor.update((tx) => tx.break.insert());

    expect(editor.children).toEqual(expected.children);
    expect(editor.selection).toEqual(expected.selection);
  });
});
