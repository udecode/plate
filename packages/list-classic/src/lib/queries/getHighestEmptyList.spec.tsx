/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { getHighestEmptyList } from './getHighestEmptyList';

jsxt;

describe('getHighestEmptyList', () => {
  it('returns undefined when the path is not inside a list', () => {
    const editor = createSlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    expect(getHighestEmptyList(editor, { liPath: [0] })).toBeUndefined();
  });

  it('returns the current list item path when the list has multiple items', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
          </hli>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;
    const editor = createSlateEditor({ value: input.children });

    expect(getHighestEmptyList(editor, { liPath: [0, 1] })).toEqual([0, 1]);
  });

  it('climbs to the parent list item when the nested list is the only child', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hul>
              <hli>
                <hlic>two</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;
    const editor = createSlateEditor({ value: input.children });

    expect(getHighestEmptyList(editor, { liPath: [0, 0, 1, 0] })).toEqual([
      0, 0,
    ]);
  });

  it('stops at diffListPath and falls back to the nested list path', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hul>
              <hli>
                <hlic>two</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;
    const editor = createSlateEditor({ value: input.children });

    expect(
      getHighestEmptyList(editor, {
        diffListPath: [0],
        liPath: [0, 0, 1, 0],
      })
    ).toEqual([0, 0, 1]);
  });
});
