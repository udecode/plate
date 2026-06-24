/** @jsx jsxt */

import type { BasePlateEditor } from '@platejs/core';
import { createListClassicRuntimeTestEditor as createBasePlateEditor } from './__tests__/createListClassicRuntimeTestEditor';

import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

describe('li > lic * 2 with selection at second child start', () => {
  it('merge the children', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hlic>
              <cursor />
              two
            </hlic>
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
        </hul>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => tx.text.deleteBackward());

    expect(editor.children).toEqual(expected.children);
  });
});

describe('li with selection at start', () => {
  it('remove the list item', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <cursor />
              one
            </hlic>
          </hli>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;

    const expected = (
      <editor>
        <hp>one</hp>
        <hul>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => tx.text.deleteBackward());

    expect(editor.children).toEqual(expected.children);
  });
});

describe('list + sublist where second item has multiple children', () => {
  it('merge all text into first sublist item', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hul>
              <hli>
                <hlic>
                  <htext />
                </hlic>
              </hli>
              <hli>
                <hlic>
                  <htext>
                    <cursor />
                    two
                  </htext>
                  <htext bold>three</htext>
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hul>
              <hli>
                <hlic>
                  <htext>
                    <cursor />
                    two
                  </htext>
                  <htext bold>three</htext>
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update((tx) => tx.text.deleteBackward());

    expect(editor.children).toEqual(expected.children);
  });
});
