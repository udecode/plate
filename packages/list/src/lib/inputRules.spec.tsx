/** @jsx jsxt */

import { BaseIndentPlugin } from '@platejs/indent';
import { jsxt } from '@platejs/test-utils';
import { KEYS, createSlateEditor } from 'platejs';

import { BaseListPlugin } from './BaseListPlugin';
import { BulletedListRules } from './BulletedListRules';
import { OrderedListRules } from './OrderedListRules';
import { TaskListRules } from './TaskListRules';

jsxt;

describe('list input rules', () => {
  const createEditor = (text: string, offset = text.length) =>
    createSlateEditor({
      plugins: [
        BaseIndentPlugin,
        BaseListPlugin.configure({
          inputRules: [
            BulletedListRules.markdown({ variant: '-' }),
            OrderedListRules.markdown({ variant: '.' }),
            TaskListRules.markdown({ checked: false }),
            TaskListRules.markdown({ checked: true }),
          ],
        }),
      ],
      selection: {
        anchor: { offset, path: [0, 0] },
        focus: { offset, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'p' }],
    } as any);

  it('creates a bullet list item when markdown group is enabled', () => {
    const editor = createEditor('-', 1);

    editor.tf.insertText(' ');

    expect(editor.children[0]).toMatchObject({
      children: [{ text: '' }],
      indent: 1,
      listStyleType: 'disc',
      type: 'p',
    });
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('creates an ordered list item from markdown shorthand', () => {
    const editor = createEditor('3.', 2);

    editor.tf.insertText(' ');

    expect(editor.children[0]).toMatchObject({
      children: [{ text: '' }],
      indent: 1,
      listStart: 3,
      listRestartPolite: 3,
      listStyleType: 'decimal',
      type: 'p',
    });
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('creates a checked todo item from [x]', () => {
    const editor = createEditor('[x]', 3);

    editor.tf.insertText(' ');

    expect(editor.children[0]).toMatchObject({
      checked: true,
      children: [{ text: '' }],
      indent: 1,
      listStyleType: KEYS.listTodo,
      type: 'p',
    });
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
