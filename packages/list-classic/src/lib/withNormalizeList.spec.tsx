/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type SlateEditor, createSlateEditor } from 'platejs';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const testNormalize = (input: SlateEditor, output: SlateEditor): void => {
  const editor = createSlateEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

  editor.tf.normalize({ force: true });

  // biome-ignore lint/suspicious/noMisplacedAssertion: helper function called inside tests
  expect(editor.children).toEqual(output.children);
};

describe('merge lists', () => {
  it('does not merge lists with different type', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hol>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hol>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hol>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hol>
      </editor>
    ) as any as SlateEditor;

    testNormalize(input, output);
  });

  it('merge the next list if it has the same type', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hul>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
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
    ) as any as SlateEditor;

    testNormalize(input, output);
  });

  it('merge the previous list if it has the same type', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hul>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
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
    ) as any as SlateEditor;

    testNormalize(input, output);
  });
});

describe('clean up lists', () => {
  it('remove list without list items', () => {
    const input = (
      <editor>
        <hul />
      </editor>
    ) as any as SlateEditor;

    const output = (<editor />) as any as SlateEditor;

    testNormalize(input, output);
  });

  it('only allow li to be child of ul', () => {
    const input = (
      <editor>
        <hul>
          <hp>bad</hp>
          <hli>
            <hlic>ok</hlic>
          </hli>
          <hp>bad</hp>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>bad</hlic>
          </hli>
          <hli>
            <hlic>ok</hlic>
          </hli>
          <hli>
            <hlic>bad</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    testNormalize(input, output);
  });
});

describe('task list normalization', () => {
  it('adds checked=false to task-list items that are missing it', () => {
    const input = {
      children: [
        {
          children: [
            { children: [{ text: 'a' }], type: 'lic' },
            { children: [{ text: 'b' }], type: 'lic' },
          ].map((child) => ({ children: [child], type: 'li' })),
          type: 'taskList',
        },
      ],
    } as any as SlateEditor;

    const output = {
      children: [
        {
          children: [
            {
              checked: false,
              children: [{ children: [{ text: 'a' }], type: 'lic' }],
              type: 'li',
            },
            {
              checked: false,
              children: [{ children: [{ text: 'b' }], type: 'lic' }],
              type: 'li',
            },
          ],
          type: 'taskList',
        },
      ],
    } as any as SlateEditor;

    testNormalize(input, output);
  });

  it('removes checked from list items outside task lists', () => {
    const input = {
      children: [
        {
          children: [
            {
              checked: true,
              children: [{ children: [{ text: 'a' }], type: 'lic' }],
              type: 'li',
            },
          ],
          type: 'ul',
        },
      ],
    } as any as SlateEditor;

    const output = {
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: 'a' }], type: 'lic' }],
              type: 'li',
            },
          ],
          type: 'ul',
        },
      ],
    } as any as SlateEditor;

    testNormalize(input, output);
  });
});

describe('nested list normalization', () => {
  it('moves direct nested lists into the previous list item', () => {
    const input = {
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: 'one' }], type: 'lic' }],
              type: 'li',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: 'two' }], type: 'lic' }],
                  type: 'li',
                },
              ],
              type: 'ul',
            },
          ],
          type: 'ul',
        },
      ],
    } as any as SlateEditor;

    const output = {
      children: [
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
                  type: 'ul',
                },
              ],
              type: 'li',
            },
          ],
          type: 'ul',
        },
      ],
    } as any as SlateEditor;

    testNormalize(input, output);
  });
});
