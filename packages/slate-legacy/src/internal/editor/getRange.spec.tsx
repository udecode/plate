/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('range', () => {
  it('returns a range between two explicit locations', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            first <anchor />
            text
          </hp>
          <hp>
            second <focus />
            text
          </hp>
        </editor>
      ) as any
    );

    expect(
      editor.api.range({ offset: 6, path: [0, 0] }, { offset: 7, path: [1, 0] })
    ).toEqual({
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 7, path: [1, 0] },
    });
  });

  it('returns the point before the current selection', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    expect(editor.api.range('before', editor.selection!)).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
  });

  it('keeps the range collapsed when asking for before at block start', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            <cursor />
            test
          </hp>
        </editor>
      ) as any
    );

    expect(editor.api.range('before', editor.selection!)).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('returns undefined when start is requested outside a block', () => {
    const editor = createEditor(
      (
        <editor>
          te
          <cursor />
          st
        </editor>
      ) as any
    );

    expect(editor.api.range('start', editor.selection!)).toBeUndefined();
  });

  it('returns undefined when start is requested without a selection', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>test</hp>
        </editor>
      ) as any
    );

    expect(editor.api.range('start', editor.selection!)).toBeUndefined();
  });

  it('returns the range from the start of the current block', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            te
            <cursor />
            st
          </hp>
        </editor>
      ) as any
    );

    expect(editor.api.range('start', editor.selection!)).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
  });
});
