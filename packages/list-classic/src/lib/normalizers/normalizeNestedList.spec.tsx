/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt } from '@platejs/test-utils';
import { KEYS } from 'platejs';

import { BaseListPlugin } from '../BaseListPlugin';
import { normalizeNestedList } from './normalizeNestedList';

jsxt;

describe('normalizeNestedList', () => {
  it('returns false when the parent is not a list', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const entry = editor.read.nodes.get([0])!;

    let result = true;

    editor.update((tx) => {
      result = !!normalizeNestedList(editor, tx, {
        nestedListItem: entry as any,
      });
    });

    expect(result).toBe(false);
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
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      value: input.children,
    });
    const entry = editor.read.nodes.get([0, 0])!;

    let result = true;

    editor.update((tx) => {
      result = !!normalizeNestedList(editor, tx, {
        nestedListItem: entry as any,
      });
    });

    expect(result).toBe(false);
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
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    let result = false;

    editor.update((tx) => {
      tx.value.replace({ children: input.children });
      const entry = tx.nodes.get([0, 1]);

      expect(entry).toBeDefined();
      result = !!normalizeNestedList(editor, tx, {
        nestedListItem: entry as any,
      });
    });

    expect(result).toBe(true);
    expect(editor.read.children()).toEqual([
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
