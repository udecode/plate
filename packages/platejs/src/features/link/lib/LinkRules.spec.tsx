import { describe, expect, it } from 'bun:test';

import { createDataTransfer } from '#platejs-test-internal';

import {
  createEditor as createProductEditor,
  type Selection,
  type Value,
} from '../../../core';
import { MarkdownPlugin } from '../../../markdown';
import { BaseCodeBlockPlugin } from '../../code-block';
import { BaseMentionPlugin } from '../../mention/lib/BaseMentionPlugin';
import type { BaseLinkDefinition } from './BaseLinkPlugin';
import { BaseLinkPlugin, LinkRules } from './BaseLinkPlugin';

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
  withMarkdown = false,
}: {
  selection: Selection;
  value: Value;
  inputRules?: ReturnType<typeof createAutolinkRules>;
  options?: Partial<BaseLinkDefinition['initialState']>;
  removeEmpty?: boolean;
  withCodeBlock?: boolean;
  withMarkdown?: boolean;
}) => {
  const linkPlugin = BaseLinkPlugin.configure({
    inputRules: inputRules ?? createAutolinkRules(),
    initialState: options,
    rules:
      removeEmpty === undefined ? undefined : { normalize: { removeEmpty } },
  });

  return createProductEditor({
    plugins: [
      ...(withCodeBlock ? [BaseCodeBlockPlugin] : []),
      linkPlugin,
      ...(withMarkdown ? [MarkdownPlugin] : []),
    ],
    selection,
    initialValue: value,
  });
};

const paste = (
  editor: ReturnType<typeof createEditor>,
  text: string,
  html?: string
) => {
  const data = createDataTransfer();

  data.setData('text/plain', text);
  if (html !== undefined) data.setData('text/html', html);
  editor.api.dom.clipboard.insertData(data);
};

const findLink = (editor: ReturnType<typeof createEditor>) =>
  editor.read.nodes.find({
    at: [],
    type: 'link',
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
          children: [{ text: 'const x = 1' }],
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
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 8, path: [0, 0] },
      },
      value: [
        {
          children: [{ text: 'selected code' }],
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

  it('keeps a pasted URL literal in link source when the clipboard also holds HTML', () => {
    const text = 'see [a](b) [Example](';
    const url = 'https://example.com';
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'paragraph' }],
    });

    paste(editor, url, `<a href="${url}">${url}</a>`);

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([0])).toBe(`${text}${url}`);
  });

  it('keeps a pasted URL literal inside a link when the clipboard also holds HTML', () => {
    const url = 'https://other.example';
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 1, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'label' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    paste(editor, url, `<a href="${url}">${url}</a>`);

    expect(editor.read.nodes.find({ at: [], type: 'link' })?.[0]).toMatchObject(
      {
        children: [{ text: `label${url}` }],
        url: 'https://example.com',
      }
    );
    expect(editor.read.text.string([0])).toBe(`label${url}`);
  });

  it('keeps a pasted URL literal in link source whose destination holds ](', () => {
    const text = '[label](https://example.com/](';
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'paragraph' }],
    });

    paste(editor, 'https://other.example');

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([0])).toBe(`${text}https://other.example`);
  });

  it.each([
    [
      'inside a link',
      {
        children: [
          { text: '' },
          {
            children: [{ text: 'label' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
      [1, 1, 0],
      5,
    ],
    [
      'after unfinished link source',
      { children: [{ text: '[x](' }], type: 'paragraph' },
      [1, 0],
      4,
    ],
  ] as const)(
    'keeps a copied mention when it is pasted %s',
    (_, target, path, offset) => {
      const editor = createProductEditor({
        plugins: [
          BaseLinkPlugin.configure({ inputRules: createAutolinkRules() }),
          BaseMentionPlugin,
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 0, path: [0, 2] },
        },
        initialValue: [
          {
            children: [
              { text: 'see ' },
              {
                children: [{ text: '' }],
                label: 'Ada',
                ref: 'user-1',
                type: 'mention',
              },
              { text: '' },
            ],
            type: 'paragraph',
          },
          target,
        ],
      });
      const data = createDataTransfer();

      editor.api.dom.clipboard.writeSelection(data);
      editor.update.selection.set({
        kind: 'text',
        anchor: { offset, path: [...path] },
        focus: { offset, path: [...path] },
      });
      editor.api.dom.clipboard.insertData(data);

      expect(
        editor.read.nodes.find({ at: [1], type: 'mention' })?.[0]
      ).toMatchObject({ label: 'Ada', ref: 'user-1' });
    }
  );

  it('keeps a pasted URL literal inside a link without a DOM parser', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 1, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'label' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const { DOMParser } = globalThis;

    Reflect.deleteProperty(globalThis, 'DOMParser');
    try {
      paste(editor, 'https://other.example');
    } finally {
      globalThis.DOMParser = DOMParser;
    }

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'labelhttps://other.example' }],
    });
  });

  it('keeps a pasted URL literal in a code block when the clipboard also holds HTML', () => {
    const url = 'https://example.com';
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'code' }], type: 'codeBlock' }],
    });

    paste(editor, url, `<a href="${url}">${url}</a>`);

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([0])).toBe(`code${url}`);
  });

  it('inserts the pasted text, not the prepared href, inside an existing link', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 1, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'label' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    paste(editor, 'https://example.com/ü');

    expect(editor.read.text.string([0])).toBe('labelhttps://example.com/ü');
  });

  it('pastes a URL as text over a link and a mention', () => {
    const editor = createProductEditor({
      plugins: [
        BaseLinkPlugin.configure({ inputRules: createAutolinkRules() }),
        BaseMentionPlugin,
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 4] },
      },
      initialValue: [
        {
          children: [
            { text: 'a ' },
            {
              children: [{ text: 'old' }],
              type: 'link',
              url: 'https://old.example',
            },
            { text: ' ' },
            { children: [{ text: '' }], label: 'x', ref: 'x', type: 'mention' },
            { text: ' b' },
          ],
          type: 'paragraph',
        },
      ],
    });

    paste(editor, 'https://new.example');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'a https://new.exampleb' }], type: 'paragraph' },
    ]);
  });

  it.each([
    ['#top', false],
    ['/docs/intro', true],
  ])('keeps pasted %s as text', (text, withMarkdown) => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      value: [{ children: [{ text: 'x ' }], type: 'paragraph' }],
      withMarkdown,
    });

    paste(editor, text);

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([0])).toBe(`x ${text}`);
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

  it('types the space after a URL the app does not allow', () => {
    const text = 'see ftp://example.com';
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'paragraph' }],
    });

    editor.update.text.insert(' ');

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([0])).toBe(`${text} `);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: text.length + 1, path: [0, 0] },
      focus: { offset: text.length + 1, path: [0, 0] },
    });
  });

  it('splits the block after a URL the app does not allow', () => {
    const text = 'see ftp://example.com';
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'paragraph' }],
    });

    editor.update.break.insert();

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.children()).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('autolinks a typed tel: number when space is inserted', () => {
    const text = 'call tel:+15551234';
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
      children: [{ text: 'tel:+15551234' }],
      url: 'tel:+15551234',
    });
  });

  it.each(['http://...', 'https://…', 'http:foo', 'tel://'])(
    'keeps the typed placeholder %s as text',
    (token) => {
      const text = `use ${token}`;
      const editor = createEditor({
        selection: {
          kind: 'text',
          anchor: { offset: text.length, path: [0, 0] },
          focus: { offset: text.length, path: [0, 0] },
        },
        value: [{ children: [{ text }], type: 'paragraph' }],
      });

      editor.update.text.insert(' ');

      expect(findLink(editor)).toBeUndefined();
    }
  );

  it('maps visible link text through parseUrl', () => {
    const text = 'visit example';
    const editor = createEditor({
      options: {
        parseUrl: (url, defaultParseUrl) =>
          url === 'example' ? 'https://example.com' : defaultParseUrl(url),
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

  it('converts markdown link syntax when the closing parenthesis is inserted [EDIT-INTERACT-LINK-AUTOMD-001]', () => {
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
      editor.read.nodes.find({
        at: [1],
        type: 'link',
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

describe('LinkRules.markdown', () => {
  const typeClosingParen = (text: string) => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'paragraph' }],
    });

    editor.update.text.insert(')');

    return editor;
  };

  it('links typed source whose destination is relative [EDIT-INTERACT-LINK-AUTOMD-001]', () => {
    const editor = typeClosingParen('[Example](example.com/a%20path');

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'Example' }],
      url: 'example.com/a%20path',
    });
  });

  it('keeps typed source whose destination the app does not allow [EDIT-INTERACT-LINK-AUTOMD-001]', () => {
    const text = '[Example](ftp://example.com';
    const editor = typeClosingParen(text);

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([])).toBe(`${text})`);
  });

  it('keeps typed image source as text [EDIT-INTERACT-LINK-AUTOMD-001]', () => {
    const text = '![alt](https://example.com/a.png';
    const editor = typeClosingParen(text);

    expect(findLink(editor)).toBeUndefined();
    expect(editor.read.text.string([])).toBe(`${text})`);
  });
});
