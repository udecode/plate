/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { isListNested } from './isListNested';

jsxt;

describe('when the list is nested', () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="2">
          <hp>2</hp>
          <hul id="21">
            <hli>
              <hp>21</hp>
            </hli>
            <hli>
              <hp>
                22
                <cursor />
              </hp>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as TestEditor;

  it('returns true', () => {
    const editor = createBaseEditor({
      selection: input.selection,
      value: input.children,
    });

    const list = editor.read.nodes.find({ match: { id: '21' } });

    expect(isListNested(editor, list?.[1] as any)).toBeTruthy();
  });
});

describe('when the list is not nested', () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="2">
          <hp>2</hp>
        </hli>
      </hul>
    </editor>
  ) as TestEditor;

  it('returns false', () => {
    const editor = createBaseEditor({
      selection: input.selection,
      value: input.children,
    });

    const list = editor.read.nodes.find({ match: { id: '1' } });

    expect(isListNested(editor, list?.[1] as any)).toBeFalsy();
  });
});
