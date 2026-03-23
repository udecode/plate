/** @jsx jsxt */

import { KEYS } from 'platejs';
import { BaseIndentPlugin } from '@platejs/indent';
import { BaseListPlugin, toggleList } from '@platejs/list';
import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from './createAutoformatEditor';

jsxt;

const createListAutoformatEditor = (value: any) =>
  createAutoformatEditor({
    plugins: [BaseListPlugin, BaseIndentPlugin],
    rules: [
      {
        match: ['* ', '- '],
        mode: 'block',
        type: 'list',
        format: (editor) => {
          toggleList(editor, { listStyleType: KEYS.ul });
        },
      },
      {
        match: [String.raw`^\d+\.$ `, String.raw`^\d+\)$ `],
        matchByRegex: true,
        mode: 'block',
        type: 'list',
        format: (editor, { matchString }) => {
          toggleList(editor, {
            listRestartPolite: Number(matchString) || 1,
            listStyleType: KEYS.ol,
          });
        },
      },
      {
        match: ['[] '],
        mode: 'block',
        type: 'list',
        format: (editor) => {
          toggleList(editor, { listStyleType: KEYS.listTodo });
          editor.tf.setNodes({
            checked: false,
            listStyleType: KEYS.listTodo,
          });
        },
      },
      {
        match: ['[x] '],
        mode: 'block',
        type: 'list',
        format: (editor) => {
          toggleList(editor, { listStyleType: KEYS.listTodo });
          editor.tf.setNodes({
            checked: true,
            listStyleType: KEYS.listTodo,
          });
        },
      },
    ],
    value,
  });

describe('AutoformatPlugin list block rules', () => {
  it.each([
    {
      expected: (
        <fragment>
          <hul>
            <hli>
              <hlic>hello</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            -
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      title: 'formats - into an unordered list item',
    },
    {
      expected: (
        <fragment>
          <hol>
            <hli>
              <hlic>hello</hlic>
            </hli>
          </hol>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            1.
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      title: 'formats 1. into an ordered list item',
    },
    {
      expected: (
        <fragment>
          <htodoli>hello</htodoli>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            []
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      title: 'formats [] into an unchecked todo item',
    },
    {
      expected: (
        <fragment>
          <htodoli checked>hello</htodoli>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            [x]
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      title: 'formats [x] into a checked todo item',
    },
  ])('$title', ({ expected, input }) => {
    const editor = createListAutoformatEditor(input);

    editor.tf.insertText(' ');

    expect(input.children).toEqual(expected.children);
  });
});
