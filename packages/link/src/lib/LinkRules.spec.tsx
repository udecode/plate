import { createBaseEditor, defineBasePlugin } from '@platejs/core';
import {
  createEditor as createPliteEditor,
  schema,
  type Selection,
  type Value,
} from '@platejs/plite';
import { createDataTransfer } from '@platejs/test-utils';
import type { BaseLinkDefinition } from './BaseLinkPlugin';
import { BaseLinkPlugin, type LinkElement } from './BaseLinkPlugin';
import { LinkRules } from './BaseLinkPlugin';

const BaseCodeLinePlugin = defineBasePlugin('codeLine', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      blockContent: false,
    },
  },
});

const BaseCodeBlockPlugin = defineBasePlugin('codeBlock', {
  dependencies: [BaseCodeLinePlugin],
  schema: {
    element: {
      content: schema.content.element(BaseCodeLinePlugin, { min: 1 }),
    },
  },
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
  withCodeBlock = true,
}: {
  selection: Selection;
  value: Value;
  inputRules?: ReturnType<typeof createAutolinkRules>;
  options?: Partial<BaseLinkDefinition['initialState']>;
  removeEmpty?: boolean;
  withCodeBlock?: boolean;
}) => {
  const linkPlugin = BaseLinkPlugin.configure({
    inputRules: inputRules ?? createAutolinkRules(),
    initialState: options,
    rules:
      removeEmpty === undefined ? undefined : { normalize: { removeEmpty } },
  });

  return createBaseEditor({
    editor: createPliteEditor<Value>(),
    plugins: withCodeBlock ? [BaseCodeBlockPlugin, linkPlugin] : [linkPlugin],
    selection,
    initialValue: value,
  });
};

const paste = (editor: ReturnType<typeof createEditor>, text: string) => {
  const data = createDataTransfer();

  data.setData('text/plain', text);
  editor.api.dom.clipboard.insertData(data);
};

const findLink = (editor: ReturnType<typeof createEditor>) =>
  editor.read.nodes.find<LinkElement>({
    at: [],
    match: { type: 'link' },
  })?.[0];

describe('LinkRules', () => {
  it('autolinks a pasted URL', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    paste(editor, 'https://example.com');

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'https://example.com' }],
      url: 'https://example.com',
    });
  });

  it('autolinks when the optional code block plugin is absent', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
      withCodeBlock: false,
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
          children: [{ children: [{ text: 'const x = 1' }], type: 'codeLine' }],
          type: 'codeBlock',
        },
        { children: [{ text: 'test' }], type: 'paragraph' },
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
    const value = [
      { children: [{ text: 'start selected' }], type: 'paragraph' },
    ];
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
            { children: [{ text: 'selected code' }], type: 'codeLine' },
          ],
          type: 'codeBlock',
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
      value: [{ children: [{ text: '[Example](' }], type: 'paragraph' }],
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
      value: [{ children: [{ text }], type: 'paragraph' }],
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
      value: [{ children: [{ text }], type: 'paragraph' }],
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
      value: [{ children: [{ text }], type: 'paragraph' }],
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
      value: [{ children: [{ text }], type: 'paragraph' }],
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
              type: 'link',
              url: 'https://existing.example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
        { children: [{ text }], type: 'paragraph' },
      ],
    });

    editor.update.text.insert(')');

    expect(
      editor.read.nodes.find<LinkElement>({
        at: [1],
        match: { type: 'link' },
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
                type: 'link',
                url: 'https://example.com',
              },
              { text: '' },
            ],
            type: 'paragraph',
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
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.update.value.replace({
      children: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: '' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
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
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.update.value.replace({
      children: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: '' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    expect(findLink(editor)).toBeDefined();
  });
});
