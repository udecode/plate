import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema, type Selection, type Value } from '@platejs/plite';
import { createDataTransfer } from '@platejs/test-utils';
import type { TLinkElement } from '@platejs/utils';

import type { BaseLinkConfig } from './BaseLinkPlugin';
import { BaseLinkPlugin } from './BaseLinkPlugin';
import { LinkRules } from './BaseLinkPlugin';

const BaseCodeLinePlugin = createBasePlugin({
  key: 'codeLine',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      topLevel: false,
    },
  },
  type: 'code_line',
});

const BaseCodeBlockPlugin = createBasePlugin({
  key: 'codeBlock',
  schema: ({ plugins }) => {
    const codeLineType = plugins.elementType(BaseCodeLinePlugin);

    return {
      element: {
        content: schema.content.type(codeLineType, {
          default: { type: codeLineType },
          min: 1,
        }),
      },
    };
  },
  type: 'code_block',
  plugins: [BaseCodeLinePlugin],
});

const createAutolinkRules = () => [
  LinkRules.autolink({ variant: 'break' }),
  LinkRules.autolink({ variant: 'paste' }),
  LinkRules.autolink({ variant: 'space' }),
  LinkRules.markdown(),
];

const createEditor = ({
  inputRules,
  options,
  removeEmpty,
  selection,
  value,
}: {
  selection: Selection;
  value: Value;
  inputRules?: ReturnType<typeof createAutolinkRules>;
  options?: Partial<BaseLinkConfig['options']>;
  removeEmpty?: boolean;
}) =>
  createBaseEditor({
    plugins: [
      BaseCodeBlockPlugin,
      BaseLinkPlugin.configure({
        inputRules: inputRules ?? createAutolinkRules(),
        options,
        rules:
          removeEmpty === undefined
            ? undefined
            : { normalize: { removeEmpty } },
      }),
    ],
    selection,
    initialValue: value,
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
        kind: 'text',
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
        kind: 'text',
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
      kind: 'text',
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 14, path: [0, 0] },
    } satisfies Selection;
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

  it('keeps pasted URLs literal for expanded selections inside code blocks', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 8, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: 'selected code' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    paste(editor, 'https://example.com');

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([0])).toBe('https://example.com code');
  });

  it('keeps pasted URLs literal inside markdown link source', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
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
        kind: 'text',
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
        kind: 'text',
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
        kind: 'text',
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
        kind: 'text',
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
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('ignores unrelated links when converting markdown link syntax', () => {
    const text = '[Example](https://example.com';
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: text.length, path: [1, 0] },
        focus: { offset: text.length, path: [1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'existing' }],
              type: 'a',
              url: 'https://existing.example.com',
            },
            { text: '' },
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
          kind: 'text',
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: text.length, path: [0, 1, 0] },
        },
        value: [
          {
            children: [
              { text: '' },
              {
                children: [{ text }],
                type: 'a',
                url: 'https://example.com',
              },
              { text: '' },
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

  it('removes an empty link introduced by a value replacement', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.value.replace({
      children: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: '' }],
              type: 'a',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    expect(findLink(editor)).toBeUndefined();
  });

  it('keeps an empty link when removeEmpty is disabled', () => {
    const editor = createEditor({
      removeEmpty: false,
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.value.replace({
      children: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: '' }],
              type: 'a',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    expect(findLink(editor)).toBeDefined();
  });
});
