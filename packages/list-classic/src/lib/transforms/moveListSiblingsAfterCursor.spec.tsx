/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt } from '@platejs/test-utils';

import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseNumberedListPlugin,
  BaseTaskListPlugin,
} from '../BaseListPlugin';
import { moveListSiblingsAfterCursor } from './moveListSiblingsAfterCursor';

jsxt;

const ListSchemaPlugins = [
  BaseBulletedListPlugin,
  BaseNumberedListPlugin,
  BaseTaskListPlugin,
  BaseListItemPlugin,
  BaseListItemContentPlugin,
];

describe('moveListSiblingsAfterCursor', () => {
  it('moves the following list items into the destination list', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
          <hli>
            <hlic>3</hlic>
          </hli>
        </hul>
        <hul>
          <hli>
            <hlic>x</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: ListSchemaPlugins,
      initialValue: input.children,
    });

    let result = false;

    editor.update((tx) => {
      result = !!moveListSiblingsAfterCursor(editor, tx, {
        at: [0, 0],
        to: [1, 1],
      });
    });

    expect(result).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            children: [{ children: [{ text: '1' }], type: 'lic' }],
            type: 'li',
          },
        ],
        type: 'ul',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'x' }], type: 'lic' }],
            type: 'li',
          },
          {
            children: [{ children: [{ text: '2' }], type: 'lic' }],
            type: 'li',
          },
          {
            children: [{ children: [{ text: '3' }], type: 'lic' }],
            type: 'li',
          },
        ],
        type: 'ul',
      },
    ]);
  });

  it('returns false when the destination stays inside the same list', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: ListSchemaPlugins,
      initialValue: input.children,
    });

    let result = true;

    editor.update((tx) => {
      result = !!moveListSiblingsAfterCursor(editor, tx, {
        at: [0, 0],
        to: [0, 1],
      });
    });

    expect(result).toBe(false);
    expect(editor.read.children()).toEqual(input.children);
  });
});
