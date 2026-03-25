/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor, KEYS } from 'platejs';

import { BaseListPlugin } from '../BaseListPlugin';
import { normalizeNestedList } from './normalizeNestedList';

jsxt;

describe('normalizeNestedList', () => {
  it('returns false when the parent is not a list', () => {
    const editor = createSlateEditor({
      plugins: [BaseListPlugin],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const entry = editor.api.node([0])!;

    expect(normalizeNestedList(editor, { nestedListItem: entry as any })).toBe(
      false
    );
  });

  it('returns false when the nested list has no previous list item sibling', () => {
    const input = (
      <editor>
        <hul>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
          </hul>
        </hul>
      </editor>
    ) as any;
    const editor = createSlateEditor({
      plugins: [BaseListPlugin],
      value: input.children,
    });
    const entry = editor.api.node([0, 0])!;

    expect(normalizeNestedList(editor, { nestedListItem: entry as any })).toBe(
      false
    );
  });

  it('moves a directly nested list under the previous list item', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
          </hli>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </hul>
      </editor>
    ) as any;
    const editor = createSlateEditor({
      plugins: [BaseListPlugin],
      value: input.children,
    });
    const entry = editor.api.node([0, 1])!;

    expect(normalizeNestedList(editor, { nestedListItem: entry as any })).toBe(
      true
    );
    expect(editor.children).toEqual([
      {
        children: [
          {
            children: [
              { children: [{ text: 'one' }], type: 'lic' },
              {
                children: [
                  {
                    children: [{ children: [{ text: 'two' }], type: 'lic' }],
                    type: 'li',
                  },
                ],
                type: editor.getType(KEYS.ulClassic),
              },
            ],
            type: 'li',
          },
        ],
        type: editor.getType(KEYS.ulClassic),
      },
    ]);
  });
});
