/** @jsx jsxt */

import type { BasePlateEditor } from '@platejs/core';
import { createListClassicRuntimeTestEditor as createBasePlateEditor } from './__tests__/createListClassicRuntimeTestEditor';

import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const createListEditor = (input: BasePlateEditor) =>
  createBasePlateEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

describe('ListClassicExtension deleteFragment', () => {
  it('falls back to normal deleteFragment when the selection is not across list items', () => {
    const input = (
      <editor>
        <hp>
          a<anchor />
          bc
          <focus />d
        </hp>
      </editor>
    ) as any as BasePlateEditor;
    const expected = (
      <editor>
        <hp>ad</hp>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createListEditor(input);

    editor.update((tx) => tx.fragment.delete());

    expect(editor.children).toEqual(expected.children);
  });

  it('merges sibling list items and removes the emptied end item', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              one
              <anchor />
            </hlic>
          </hli>
          <hli>
            <hlic>
              <focus />
              two
            </hlic>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;
    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createListEditor(input);

    editor.update((tx) => tx.fragment.delete());

    expect(editor.children).toEqual(expected.children);
  });

  it('removes only the emptied nested list when the outer start list is protected', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              one
              <anchor />
            </hlic>
            <hul>
              <hli>
                <hlic>
                  <focus />
                  two
                </hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;
    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createListEditor(input);

    editor.update((tx) => tx.fragment.delete());

    expect(editor.children).toEqual(expected.children);
  });
});
