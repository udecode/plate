import { describe, expect, it } from 'bun:test';

import { definePlugin, schema } from 'platejs';
import { CodeBlockPlugin, createEditor } from 'platejs/react';

import { linkPlugin } from './link';

const decodeEditor = createEditor({ plugins: [linkPlugin] });

describe('LinkPlugin.api.decodeUrl', () => {
  it('decodes URL', () => {
    const url = 'https://example.com/path?query=%E3%81%82';
    expect(decodeEditor.plugin(linkPlugin).api.decodeUrl(url)).toEqual(
      'https://example.com/path?query=あ'
    );
  });

  it('handles malformed URI sequence', () => {
    const url = 'https://example.com/path?query=%';
    expect(decodeEditor.plugin(linkPlugin).api.decodeUrl(url)).toEqual(url);
  });
});

describe('LinkPlugin floating API', () => {
  it('preserves configured state when hiding the toolbar', () => {
    const configuredPlugin = linkPlugin.configure({
      initialState: {
        allowedSchemes: ['https'],
      },
    });
    const innerEditor = createEditor({ plugins: [configuredPlugin] });
    const link = innerEditor.plugin(configuredPlugin);

    link.store.set({ mode: 'insert', text: 'draft', url: '/draft' });
    link.api.hide();

    expect(link.store.get()).toMatchObject({
      allowedSchemes: ['https'],
      mode: '',
      text: '',
      url: '',
    });
  });

  it('reopens edit mode from the current link selection after hiding', () => {
    const innerEditor2 = createEditor({
      plugins: [linkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'hello' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const link = innerEditor2.plugin(linkPlugin);

    link.api.show('edit', innerEditor2.id);
    link.api.hide();

    expect(link.api.trigger({ focused: true })).toBe(true);
    expect(link.store.get()).toMatchObject({
      isEditing: true,
      mode: 'edit',
      openEditorId: innerEditor2.id,
      url: 'https://example.com',
    });
  });

  it('does not trigger a stale link selection in an unfocused editor', () => {
    const innerEditor3 = createEditor({
      plugins: [linkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'hello' }],
              type: 'link',
              url: 'https://example.com',
            },
          ],
          type: 'paragraph',
        },
      ],
    });
    const link = innerEditor3.plugin(linkPlugin);

    expect(link.api.trigger({ focused: false })).toBe(false);
    expect(link.store.get().mode).toBe('');
  });

  it('opens insert mode with selected text', () => {
    const innerEditor4 = createEditor({
      plugins: [linkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 13, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'selected text' }], type: 'paragraph' },
      ],
    });

    const triggered = innerEditor4
      .plugin(linkPlugin)
      .api.triggerInsert({ focused: true });

    expect(triggered).toBe(true);
    expect(innerEditor4.plugin(linkPlugin).store.get()).toMatchObject({
      mode: 'insert',
      openEditorId: innerEditor4.id,
      text: 'selected text',
    });
  });

  it('does not open the form where a link cannot land', () => {
    const codeEditor = createEditor({
      plugins: [CodeBlockPlugin, linkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'code here' }], type: 'codeBlock' }],
    });
    const link = codeEditor.plugin(linkPlugin);

    expect(link.api.trigger({ focused: true })).toBe(false);
    expect(link.store.get().mode).toBe('');
  });

  it('opens the form in a block with open content', () => {
    const NotePlugin = definePlugin('note', {
      schema: { element: { content: schema.content.open() } },
    });
    const noteEditor = createEditor({
      plugins: [NotePlugin, linkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'note text' }], type: 'note' }],
    });
    const link = noteEditor.plugin(linkPlugin);

    expect(link.api.trigger({ focused: true })).toBe(true);
    expect(link.store.get().mode).toBe('insert');
  });

  it('loads link state into edit mode and strips duplicate URL text', () => {
    const innerEditor5 = createEditor({
      plugins: [linkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 1, 0] },
        focus: { offset: 3, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'https://x.dev' }],
              target: '_blank',
              type: 'link',
              url: 'https://x.dev',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const triggered = innerEditor5.plugin(linkPlugin).api.triggerEdit();

    expect(triggered).toBe(true);
    expect(innerEditor5.plugin(linkPlugin).store.get()).toMatchObject({
      isEditing: true,
      newTab: true,
      text: '',
      url: 'https://x.dev',
    });
  });

  it('loads the selected link when the document contains multiple links', () => {
    const innerEditor6 = createEditor({
      plugins: [linkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 3, 0] },
        focus: { offset: 3, path: [0, 3, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'first' }],
              type: 'link',
              url: 'https://first.dev',
            },
            { text: ' and ' },
            {
              children: [{ text: 'second' }],
              type: 'link',
              url: 'https://second.dev',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const triggered = innerEditor6.plugin(linkPlugin).api.triggerEdit();

    expect(triggered).toBe(true);
    expect(innerEditor6.plugin(linkPlugin).store.get()).toMatchObject({
      text: 'second',
      url: 'https://second.dev',
    });
  });

  it('routes edit mode through the edit trigger', () => {
    const innerEditor7 = createEditor({
      plugins: [
        linkPlugin.configure({
          initialState: { mode: 'edit' },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'hello' }],
              type: 'link',
              url: 'https://x.dev',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    innerEditor7.plugin(linkPlugin).api.trigger({ focused: true });

    expect(innerEditor7.plugin(linkPlugin).store.get()).toMatchObject({
      isEditing: true,
      text: 'hello',
      url: 'https://x.dev',
    });
  });
});

const createDraftEditor = () =>
  createEditor({
    plugins: [linkPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: 'kept' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

it.each([
  'google',
  'www.example.com',
  'guide.html',
  'https:www.example.com',
  'example.com:8080',
  'ftp://example.com',
])('keeps a refused %s draft open and unchanged', (url) => {
  const editor = createDraftEditor();
  const link = editor.plugin(linkPlugin);
  link.api.show('insert', editor.id);
  link.store.set({ url, text: 'rejected' });
  const before = editor.read.lastCommit();
  expect(link.api.submit()).toBeUndefined();
  expect(link.store.get()).toMatchObject({
    mode: 'insert',
    url,
    text: 'rejected',
  });
  expect(editor.read.lastCommit()).toBe(before);
});

it.each(['#top', '/docs', '?q=1', '../guide.html'])(
  'saves a %s draft',
  (url) => {
    const editor = createDraftEditor();
    const link = editor.plugin(linkPlugin);
    link.api.show('insert', editor.id);
    link.store.set({ url, text: 'Open' });
    expect(link.api.submit()).toBe(true);
    expect(
      editor.read.nodes.find({ at: [], type: linkPlugin })?.[0]
    ).toMatchObject({ url });
  }
);

it('saves a draft in an allowed custom scheme as typed', () => {
  const configuredPlugin = linkPlugin.configure({
    initialState: { allowedSchemes: ['https', 'com.example.app'] },
  });
  const editor = createEditor({
    plugins: [configuredPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  const link = editor.plugin(configuredPlugin);
  link.api.show('insert', editor.id);
  link.store.set({ url: 'com.example.app:1234', text: 'Open' });
  expect(link.api.submit()).toBe(true);
  expect(
    editor.read.nodes.find({ at: [], type: configuredPlugin })?.[0]
  ).toMatchObject({ url: 'com.example.app:1234' });
});

const createLinkEditor = (url: string) =>
  createEditor({
    plugins: [linkPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 2, path: [0, 1, 0] },
      focus: { offset: 2, path: [0, 1, 0] },
    },
    initialValue: [
      {
        children: [
          { text: '' },
          { children: [{ text: 'Open' }], type: 'link', url },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ],
  });

it.each(['com.example.app:1234', ' guide.html '])(
  'saves a new label and keeps the stored address %p',
  (url) => {
    const editor = createLinkEditor(url);
    const link = editor.plugin(linkPlugin);
    link.api.triggerEdit();
    link.store.set({ text: 'Open now' });
    expect(link.api.submit()).toBe(true);
    expect(
      editor.read.nodes.find({ at: [], type: linkPlugin })?.[0]
    ).toMatchObject({ children: [{ text: 'Open now' }], url });
  }
);

it('saves an edited relative address', () => {
  const editor = createLinkEditor('guide.html');
  const link = editor.plugin(linkPlugin);
  link.api.triggerEdit();
  link.store.set({ url: './guide2.html' });
  expect(link.api.submit()).toBe(true);
  expect(
    editor.read.nodes.find({ at: [], type: linkPlugin })?.[0]
  ).toMatchObject({ url: './guide2.html' });
});

it('shows the stored address as the label when the label is cleared', () => {
  const editor = createLinkEditor('guide.html');
  const link = editor.plugin(linkPlugin);
  link.api.triggerEdit();
  link.store.set({ text: '' });
  expect(link.api.submit()).toBe(true);
  expect(
    editor.read.nodes.find({ at: [], type: linkPlugin })?.[0]
  ).toMatchObject({ children: [{ text: 'guide.html' }], url: 'guide.html' });
});
