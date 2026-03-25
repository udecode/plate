/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const createListEditor = (input: SlateEditor) =>
  createSlateEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

describe('withDeleteFragmentList', () => {
  it('falls back to normal deleteFragment when the selection is not across list items', () => {
    const input = (
      <editor>
        <hp>
          a<anchor />
          bc
          <focus />d
        </hp>
      </editor>
    ) as any as SlateEditor;
    const expected = (
      <editor>
        <hp>ad</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createListEditor(input);

    editor.tf.deleteFragment();

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
    ) as any as SlateEditor;
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
    ) as any as SlateEditor;

    const editor = createListEditor(input);

    editor.tf.deleteFragment();

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
    ) as any as SlateEditor;
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
    ) as any as SlateEditor;

    const editor = createListEditor(input);

    editor.tf.deleteFragment();

    expect(editor.children).toEqual(expected.children);
  });
});
