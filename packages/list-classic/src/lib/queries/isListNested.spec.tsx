/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import type { SlateEditor } from '@platejs/core';
import { createListClassicLegacyTestEditor as createSlateEditor } from '../__tests__/createListClassicLegacyTestEditor';

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
  ) as any as SlateEditor;

  it('returns true', () => {
    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    const list = editor.api.node({ id: '21' });

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
  ) as any as SlateEditor;

  it('returns false', () => {
    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    const list = editor.api.node({ id: '1' });

    expect(isListNested(editor, list?.[1] as any)).toBeFalsy();
  });
});
