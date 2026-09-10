import { describe, expect, it, mock } from 'bun:test';

import { createEditor } from 'platejs/react';

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
        forceSubmit: true,
      },
    });
    const innerEditor = createEditor({ plugins: [configuredPlugin] });
    const link = innerEditor.plugin(configuredPlugin);

    link.store.set({ mode: 'insert', text: 'draft', url: '/draft' });
    link.api.hide();

    expect(link.store.get()).toMatchObject({
      forceSubmit: true,
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

    expect(link.api.trigger({ focused: false })).toBeUndefined();
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

it('keeps a rejected draft open and unchanged', () => {
  const editor = createEditor({
    plugins: [
      linkPlugin.configure({
        initialState: { transformInput: () => 'javascript:noop()' },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'kept' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    },
  });
  const link = editor.plugin(linkPlugin);
  link.api.show('insert', editor.id);
  link.store.set({ url: 'https://example.com/a path', text: 'rejected' });
  const before = editor.read.lastCommit();
  expect(link.api.submit()).toBeUndefined();
  expect(link.store.get()).toMatchObject({
    mode: 'insert',
    url: 'https://example.com/a path',
    text: 'rejected',
  });
  expect(editor.read.lastCommit()).toBe(before);
});

it('submits a raw draft through one transformation and closes after insertion', () => {
  const transformInput = mock((url: string) => `https://${url}`);
  const editor = createEditor({
    plugins: [linkPlugin.configure({ initialState: { transformInput } })],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  const link = editor.plugin(linkPlugin);
  link.api.show('insert', editor.id);
  link.store.set({ url: 'example.com/a path', text: 'Example' });
  expect(link.api.submit()).toBe(true);
  expect(transformInput).toHaveBeenCalledTimes(1);
  expect(
    editor.read.nodes.find({ at: [], type: linkPlugin })?.[0]
  ).toMatchObject({ url: 'https://example.com/a%20path' });
  expect(link.store.get()).toMatchObject({ mode: '', url: '', text: '' });
});
