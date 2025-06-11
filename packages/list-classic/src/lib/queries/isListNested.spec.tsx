/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor } from 'platejs';
import { createSlateEditor } from 'platejs';

import { isListNested } from './isListNested';

jsxt;

describe('when the list is nested', () => {
  const input = createEditor(
    (
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
    ) as any
  );

  it('should be', () => {
    const editor = createSlateEditor({ editor: input });

    const list = editor.api.node({ id: '21' });

    expect(isListNested(editor, list?.[1] as any)).toBeTruthy();
  });
});

describe('when the list is not nested', () => {
  const input = createEditor(
    (
      <editor>
        <hul id="1">
          <hli id="2">
            <hp>2</hp>
          </hli>
        </hul>
      </editor>
    ) as any
  );

  it('should be', () => {
    const editor = createSlateEditor({ editor: input });

    const list = editor.api.node({ id: '1' });

    expect(isListNested(editor, list?.[1] as any)).toBeFalsy();
  });
});
