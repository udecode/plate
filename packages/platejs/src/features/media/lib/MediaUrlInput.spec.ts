import { expect, it, mock } from 'bun:test';

import { createEditor } from '../../../core';
import { BaseImagePlugin } from './image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from './media-embed/BaseMediaEmbedPlugin';

const createTestEditor = () =>
  createEditor({
    plugins: [BaseImagePlugin, BaseMediaEmbedPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: 'source' }], type: 'paragraph' }],
  });

it('inserts an image and caption through the selected feature', async () => {
  const editor = createTestEditor();
  expect(
    await editor
      .plugin(BaseImagePlugin)
      .api.insertUrl(() => 'https://platejs.org/image.png', {
        caption: 'Caption',
      })
  ).toBe(true);
  expect(editor.read.children()[1]).toMatchObject({
    type: 'image',
    url: 'https://platejs.org/image.png',
    children: [{ text: 'Caption' }],
  });
});

it('inserts and normalizes an embed without requiring an image plugin', async () => {
  const editor = createEditor({
    plugins: [BaseMediaEmbedPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
  });
  expect(
    await editor
      .plugin(BaseMediaEmbedPlugin)
      .api.insertUrl(() => 'https://www.youtube.com/watch?v=M7lc1UVf-VE', {
        at: [1],
      })
  ).toBe(true);
  expect(editor.read.children()[1]).toMatchObject({
    type: 'mediaEmbed',
    provider: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
  });
});

it('keeps an asynchronous media target through selection loss', async () => {
  const editor = createTestEditor();
  let resolveUrl!: (url: string) => void;
  const pending = editor.plugin(BaseImagePlugin).api.insertUrl(
    () =>
      new Promise<string>((resolve) => {
        resolveUrl = resolve;
      })
  );
  editor.update.selection.set(null);
  resolveUrl('https://example.com/image.png');
  expect(await pending).toBe(true);
  expect(editor.read.children()[1]).toMatchObject({
    type: 'image',
    url: 'https://example.com/image.png',
  });
});

it('keeps an explicit insertion target while the document changes', async () => {
  const editor = createTestEditor();
  let resolveUrl!: (url: string) => void;
  const pending = editor.plugin(BaseImagePlugin).api.insertUrl(
    () =>
      new Promise<string>((resolve) => {
        resolveUrl = resolve;
      }),
    { at: [1] }
  );
  editor.update.nodes.insert(
    { type: 'paragraph', children: [{ text: 'before' }] },
    { at: [0] }
  );
  resolveUrl('https://example.com/image.png');
  expect(await pending).toBe(true);
  expect(editor.read.children()[2]).toMatchObject({ type: 'image' });
});

it('stops when the original block is removed during URL input', async () => {
  const editor = createTestEditor();
  let resolveUrl!: (url: string) => void;
  const pending = editor.plugin(BaseImagePlugin).api.insertUrl(
    () =>
      new Promise<string>((resolve) => {
        resolveUrl = resolve;
      })
  );
  editor.update.nodes.remove({ at: [0] });
  resolveUrl('https://example.com/image.png');
  expect(await pending).toBe(false);
  expect(
    editor.read.nodes.find({ at: [], type: BaseImagePlugin })
  ).toBeUndefined();
});

it.each([null, '', 'not a URL'])(
  'leaves the document unchanged for cancelled or invalid input %s',
  async (url) => {
    const editor = createTestEditor();
    const commit = editor.read.lastCommit();
    expect(
      await editor.plugin(BaseImagePlugin).api.insertUrl(() => url, { at: [1] })
    ).toBe(false);
    expect(editor.read.lastCommit()).toBe(commit);
  }
);

it('does not request input without an insertion target', async () => {
  const editor = createTestEditor();
  editor.update.selection.set(null);
  const getUrl = mock(() => 'https://example.com/image.png');
  expect(await editor.plugin(BaseImagePlugin).api.insertUrl(getUrl)).toBe(
    false
  );
  expect(getUrl).not.toHaveBeenCalled();
});

it('propagates a rejected resolver without changing the document', async () => {
  const editor = createTestEditor();
  const commit = editor.read.lastCommit();
  await expect(
    editor
      .plugin(BaseImagePlugin)
      .api.insertUrl(() => Promise.reject(new Error('Input closed')), {
        at: [1],
      })
  ).rejects.toThrow('Input closed');
  expect(editor.read.lastCommit()).toBe(commit);
});

it('uses the installed insertion override after URL resolution', async () => {
  const insert = mock(() => false);
  const plugin = BaseImagePlugin.extend({ update: () => ({ insert }) });
  const editor = createEditor({
    plugins: [plugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
  });
  expect(
    await editor
      .plugin(plugin)
      .api.insertUrl(() => 'https://example.com/image.png', { at: [1] })
  ).toBe(false);
  expect(insert).toHaveBeenCalledTimes(1);
  expect(editor.read.children()).toHaveLength(1);
});

it('uses the installed insertion override for a captured source block', async () => {
  const insert = mock(() => false);
  const plugin = BaseImagePlugin.extend({ update: () => ({ insert }) });
  const editor = createEditor({
    plugins: [plugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  expect(
    await editor
      .plugin(plugin)
      .api.insertUrl(() => 'https://example.com/image.png', {
        replaceEmpty: true,
      })
  ).toBe(false);
  expect(insert).toHaveBeenCalledTimes(1);
  expect(insert.mock.calls[0][1]).toMatchObject({
    after: { type: 'paragraph' },
    replaceEmpty: true,
  });
  expect(editor.read.children()).toHaveLength(1);
});

it.each([false, true])(
  'rechecks the moved source before replacing it after URL input (edited: %s)',
  async (edited) => {
    const editor = createEditor({
      plugins: [BaseImagePlugin],
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
    let resolveUrl!: (url: string) => void;
    const pending = editor.plugin(BaseImagePlugin).api.insertUrl(
      () =>
        new Promise((resolve) => {
          resolveUrl = resolve;
        }),
      { replaceEmpty: true, select: true }
    );
    editor
      .update({ history: 'new-batch' })
      .nodes.insert(
        { type: 'paragraph', children: [{ text: 'before' }] },
        { at: [0] }
      );
    if (edited) {
      editor.update.text.insert('keep', { at: { path: [1, 0], offset: 0 } });
    }
    editor.update.selection.set(null);
    const previous = editor.read.children();
    const version = editor.read.lastCommit()?.version ?? 0;
    resolveUrl('https://example.com/image.png');
    expect(await pending).toBe(true);
    expect(editor.read.children().map((node) => node.type)).toEqual(
      edited ? ['paragraph', 'paragraph', 'image'] : ['paragraph', 'image']
    );
    if (edited) {
      expect(editor.read.children()[1]).toMatchObject({
        children: [{ text: 'keep' }],
      });
    }
    expect(editor.read.lastCommit()?.version).toBe(version + 1);
    editor.update.history.undo();
    expect(editor.read.children()).toEqual(previous);
  }
);
