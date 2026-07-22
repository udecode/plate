import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property, type Selection, type Value } from '@platejs/plite';
import type { TLinkElement } from '@platejs/utils';

import type { BaseLinkConfig } from './BaseLinkPlugin';
import { BaseLinkPlugin } from './BaseLinkPlugin';

const mark = (key: string) =>
  createBasePlugin({
    key,
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

const createEditor = ({
  options,
  selection,
  value,
}: {
  selection?: Selection;
  value: Value;
  options?: Partial<BaseLinkConfig['options']>;
}) =>
  createBaseEditor({
    plugins: [
      mark('bold'),
      mark('italic'),
      options ? BaseLinkPlugin.configure({ options }) : BaseLinkPlugin,
    ],
    selection,
    initialValue: value,
  });

const findLink = (
  editor: ReturnType<typeof createEditor>
): TLinkElement | undefined =>
  editor.read.nodes.find<TLinkElement>({
    at: [],
    match: { type: 'a' },
  })?.[0];

describe('editor.update.link.upsert', () => {
  it('inserts a URL at a collapsed selection', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'p' }],
    });

    expect(editor.update.link.upsert({ url: 'https://example.com' })).toBe(
      true
    );
    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'https://example.com' }],
      url: 'https://example.com',
    });
  });

  it('uses custom text and preserves focused leaf marks', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ bold: true, text: 'test' }], type: 'p' }],
    });

    editor.update.link.upsert({
      text: 'Example',
      url: 'https://example.com',
    });

    expect(findLink(editor)).toMatchObject({
      children: [{ bold: true, text: 'Example' }],
      url: 'https://example.com',
    });
  });

  it('updates URL, target, and text inside an existing link', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'old' }],
              type: 'a',
              url: 'https://old.dev',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.link.upsert({
      target: '_blank',
      text: 'new',
      url: 'https://new.dev',
    });

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'new' }],
      target: '_blank',
      url: 'https://new.dev',
    });
  });

  it('inserts text when requested inside an existing link', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 1, 0] },
        focus: { offset: 3, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'old' }],
              type: 'a',
              url: 'https://old.dev',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.link.upsert({
      insertTextInLink: true,
      url: ' appended',
    });

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'old appended' }],
      url: 'https://old.dev',
    });
  });

  it('uses the URL when replacement text is empty', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'old' }],
              type: 'a',
              url: 'https://old.dev',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ],
    });

    editor.update.link.upsert({ text: '', url: 'https://new.dev' });

    expect(findLink(editor)?.children).toEqual([{ text: 'https://new.dev' }]);
  });

  it('wraps an expanded selection and can replace its text', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [{ children: [{ italic: true, text: 'hello world' }], type: 'p' }],
    });

    editor.update.link.upsert({
      text: 'Example',
      url: 'https://example.com',
    });

    expect(findLink(editor)).toMatchObject({
      children: [{ italic: true, text: 'Example' }],
      url: 'https://example.com',
    });
    expect(editor.read.text.string([0])).toBe('Example world');
  });

  it('rejects invalid URLs unless validation is skipped', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'p' }],
    });

    expect(editor.update.link.upsert({ url: 'not a url' })).toBeUndefined();
    expect(findLink(editor)).toBeUndefined();

    expect(
      editor.update.link.upsert({ skipValidation: true, url: 'not a url' })
    ).toBe(true);
    expect(findLink(editor)?.url).toBe('not a url');
  });

  it('honors a custom URL validator', () => {
    const editor = createEditor({
      options: { isUrl: (url) => url.startsWith('/custom') },
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    expect(editor.update.link.upsert({ url: '/internal' })).toBeUndefined();
    expect(editor.update.link.upsert({ url: '/custom/value' })).toBe(true);
  });

  it('does nothing without a selection', () => {
    const editor = createEditor({
      value: [{ children: [{ text: 'test' }], type: 'p' }],
    });

    expect(
      editor.update.link.upsert({ url: 'https://example.com' })
    ).toBeUndefined();
    expect(findLink(editor)).toBeUndefined();
  });
});
