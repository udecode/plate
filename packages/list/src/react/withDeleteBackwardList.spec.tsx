/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { ListPlugin } from './ListPlugin';

jsxt;

describe('li > lic * 2 with selection at second child start', () => {
  it('should merge the children', () => {
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
    ) as any as SlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      plugins: [ListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward();

    expect(editor.children).toEqual(expected.children);
  });
});

describe('li with selection at start', () => {
  it('should remove the list item', () => {
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
    ) as any as SlateEditor;

    const expected = (
      <editor>
        <hp>one</hp>
        <hul>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      plugins: [ListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward();

    expect(editor.children).toEqual(expected.children);
  });
});

describe('list + sublist where second item has multiple children', () => {
  it('should merge all text into first sublist item', () => {
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
    ) as any as SlateEditor;

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
    ) as any as SlateEditor;

    const editor = createPlateEditor({
      plugins: [ListPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward();

    expect(editor.children).toEqual(expected.children);
  });
});
