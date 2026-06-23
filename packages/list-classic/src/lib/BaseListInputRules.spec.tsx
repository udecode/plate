/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlatePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { createListClassicLegacyTestEditor as createSlateEditor } from './__tests__/createListClassicLegacyTestEditor';

import { BaseListPlugin } from './BaseListPlugin';
import { BulletedListRules } from './BulletedListRules';
import { OrderedListRules } from './OrderedListRules';
import { TaskListRules } from './TaskListRules';

jsxt;

const BaseCodeBlockPlugin = createSlatePlugin({
  key: KEYS.codeBlock,
  node: { isElement: true },
});

describe('BaseListPlugin input rules', () => {
  it('stays literal until markdown groups are explicitly enabled', () => {
    const editor = createSlateEditor({
      plugins: [BaseListPlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [{ children: [{ text: '-hello' }], type: 'p' }],
    } as any);

    editor.update((tx) => tx.text.insert(' '));

    expect(editor.children).toEqual([
      { children: [{ text: '- hello' }], type: 'p' },
    ]);
  });

  it.each([
    {
      input: [{ children: [{ text: '-hello' }], type: 'p' }],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      title: 'formats bullet shorthand',
    },
    {
      input: [{ children: [{ text: '1.hello' }], type: 'p' }],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      title: 'formats ordered shorthand',
    },
  ])('$title', ({ input, selection, title }) => {
    const editor = createSlateEditor({
      plugins: [
        BaseListPlugin.configure({
          inputRules: [
            BulletedListRules.markdown({ variant: '-' }),
            BulletedListRules.markdown({ variant: '*' }),
            OrderedListRules.markdown({ variant: '.' }),
            OrderedListRules.markdown({ variant: ')' }),
            TaskListRules.markdown({ checked: false }),
            TaskListRules.markdown({ checked: true }),
          ],
        }),
      ],
      selection,
      value: input,
    } as any);

    editor.update((tx) => tx.text.insert(' '));

    expect(editor.children).toEqual([
      {
        children: [
          {
            children: [
              { children: [{ text: 'hello' }], type: editor.getType(KEYS.lic) },
            ],
            type: editor.getType(KEYS.li),
          },
        ],
        type:
          title === 'formats bullet shorthand'
            ? editor.getType(KEYS.ulClassic)
            : editor.getType(KEYS.olClassic),
      },
    ]);
  });

  it.each([
    {
      checked: false,
      input: [
        {
          children: [{ text: '[]hello' }],
          type: 'p',
        },
      ],
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      title: 'formats unchecked task shorthand',
    },
    {
      checked: true,
      input: [
        {
          children: [{ text: '[x]hello' }],
          type: 'p',
        },
      ],
      selection: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      title: 'formats checked task shorthand',
    },
  ])('$title', ({ checked, input, selection }) => {
    const editor = createSlateEditor({
      plugins: [
        BaseListPlugin.configure({
          inputRules: [
            BulletedListRules.markdown({ variant: '-' }),
            BulletedListRules.markdown({ variant: '*' }),
            OrderedListRules.markdown({ variant: '.' }),
            OrderedListRules.markdown({ variant: ')' }),
            TaskListRules.markdown({ checked: false }),
            TaskListRules.markdown({ checked: true }),
          ],
        }),
      ],
      selection,
      value: input,
    } as any);

    editor.update((tx) => tx.text.insert(' '));

    expect(editor.children).toEqual([
      {
        children: [
          {
            checked,
            children: [{ children: [{ text: 'hello' }], type: 'lic' }],
            type: 'li',
          },
        ],
        type: 'taskList',
      },
    ]);
  });

  it('keeps list shorthand literal inside code blocks', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseCodeBlockPlugin,
        BaseListPlugin.configure({
          inputRules: [
            BulletedListRules.markdown({ variant: '-' }),
            BulletedListRules.markdown({ variant: '*' }),
            OrderedListRules.markdown({ variant: '.' }),
            OrderedListRules.markdown({ variant: ')' }),
            TaskListRules.markdown({ checked: false }),
            TaskListRules.markdown({ checked: true }),
          ],
        }),
      ],
      selection: {
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: '-code' }],
              type: KEYS.codeLine,
            },
          ],
          type: KEYS.codeBlock,
        },
      ],
    } as any);

    editor.update((tx) => tx.text.insert(' '));

    expect(editor.children).toEqual([
      {
        children: [
          {
            children: [{ text: '- code' }],
            type: editor.getType(KEYS.codeLine),
          },
        ],
        type: editor.getType(KEYS.codeBlock),
      },
    ]);
  });
});
