import { createBaseEditor } from '@platejs/core';
import type { Selection, Value } from '@platejs/plite';
import { createDataTransfer } from '@platejs/test-utils';
import type { TLinkElement } from '@platejs/utils';

import type { BaseLinkConfig } from './BaseLinkPlugin';
import { BaseLinkPlugin } from './BaseLinkPlugin';
import { LinkRules } from './LinkRules';

const createAutolinkRules = () => [
  LinkRules.autolink({ variant: 'break' }),
  LinkRules.autolink({ variant: 'paste' }),
  LinkRules.autolink({ variant: 'space' }),
  LinkRules.markdown(),
];

const createEditor = ({
  inputRules,
  options,
  selection,
  value,
}: {
  selection: Selection;
  value: Value;
  inputRules?: ReturnType<typeof createAutolinkRules>;
  options?: Partial<BaseLinkConfig['options']>;
}) =>
  createBaseEditor({
    plugins: [
      BaseLinkPlugin.configure({
        inputRules: inputRules ?? createAutolinkRules(),
        options,
      }),
    ],
    selection,
    value,
  });

const paste = (editor: ReturnType<typeof createEditor>, text: string) => {
  const data = createDataTransfer();

  data.setData('text/plain', text);
  editor.api.clipboard.insertData(data);
};

const findLink = (editor: ReturnType<typeof createEditor>) =>
  editor.read.nodes.find<TLinkElement>({
    at: [],
    match: { type: 'a' },
  })?.[0];

describe('LinkRules', () => {
  it('autolinks a pasted URL', () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'p' }],
    });

    paste(editor, 'https://example.com');

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'https://example.com' }],
      url: 'https://example.com',
    });
  });

  it('ignores unrelated code blocks when autolinking a pasted URL', () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 4, path: [1, 0] },
        focus: { offset: 4, path: [1, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: 'const x = 1' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
        { children: [{ text: 'test' }], type: 'p' },
      ],
    });

    paste(editor, 'https://example.com');

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'https://example.com' }],
      url: 'https://example.com',
    });
  });

  it('keeps selected text by default and can replace it with the URL', () => {
    const selection = {
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 14, path: [0, 0] },
    };
    const value = [{ children: [{ text: 'start selected' }], type: 'p' }];
    const keepEditor = createEditor({ selection, value });
    const replaceEditor = createEditor({
      options: { keepSelectedTextOnPaste: false },
      selection,
      value,
    });

    paste(keepEditor, 'https://example.com');
    paste(replaceEditor, 'https://example.com');

    expect(findLink(keepEditor)?.children).toEqual([{ text: 'selected' }]);
    expect(findLink(replaceEditor)?.children).toEqual([
      { text: 'https://example.com' },
    ]);
  });

  it('keeps pasted URLs literal inside markdown link source', () => {
    const editor = createEditor({
      selection: {
        anchor: { offset: 10, path: [0, 0] },
        focus: { offset: 10, path: [0, 0] },
      },
      value: [{ children: [{ text: '[Example](' }], type: 'p' }],
    });

    paste(editor, 'https://example.com');

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([0])).toBe('[Example](https://example.com');
  });

  it('autolinks a URL when space is inserted', () => {
    const text = 'visit https://example.com';
    const editor = createEditor({
      selection: {
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'p' }],
    });

    editor.update.text.insert(' ');

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'https://example.com' }],
      url: 'https://example.com',
    });
    expect(editor.read.text.string([0])).toBe('visit https://example.com ');
  });

  it('uses getUrlHref for visible link text', () => {
    const text = 'visit example';
    const editor = createEditor({
      options: {
        getUrlHref: (url) =>
          url === 'example' ? 'https://example.com' : undefined,
      },
      selection: {
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'p' }],
    });

    editor.update.text.insert(' ');

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'example' }],
      url: 'https://example.com',
    });
  });

  it('finalizes an autolink before inserting a break', () => {
    const text = 'https://example.com';
    const editor = createEditor({
      selection: {
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'p' }],
    });

    editor.update.break.insert();

    expect(findLink(editor)?.url).toBe('https://example.com');
    expect(editor.read.children()).toHaveLength(2);
  });

  it('converts markdown link syntax when the closing parenthesis is inserted', () => {
    const text = '[Example](https://example.com';
    const editor = createEditor({
      selection: {
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'p' }],
    });

    editor.update.text.insert(')');

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'Example' }],
      url: 'https://example.com',
    });
  });

  it('ignores unrelated links when converting markdown link syntax', () => {
    const text = '[Example](https://example.com';
    const editor = createEditor({
      selection: {
        anchor: { offset: text.length, path: [1, 0] },
        focus: { offset: text.length, path: [1, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ text: 'existing' }],
              type: 'a',
              url: 'https://existing.example.com',
            },
          ],
          type: 'p',
        },
        { children: [{ text }], type: 'p' },
      ],
    });

    editor.update.text.insert(')');

    expect(
      editor.read.nodes.find<TLinkElement>({
        at: [1],
        match: { type: 'a' },
      })?.[0]
    ).toMatchObject({
      children: [{ text: 'Example' }],
      url: 'https://example.com',
    });
  });

  it('removes an empty link but keeps a zero-width-space link', () => {
    const createLinkEditor = (text: string) =>
      createEditor({
        selection: {
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: text.length, path: [0, 0, 0] },
        },
        value: [
          {
            children: [
              {
                children: [{ text }],
                type: 'a',
                url: 'https://example.com',
              },
            ],
            type: 'p',
          },
        ],
      });
    const emptyEditor = createLinkEditor('x');
    const zeroWidthEditor = createLinkEditor('\u200B');

    emptyEditor.update.fragment.delete();
    zeroWidthEditor.update.value.repair();

    expect(findLink(emptyEditor)).toBeUndefined();
    expect(findLink(zeroWidthEditor)).toBeDefined();
  });
});
