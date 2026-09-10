import { describe, expect, it } from 'bun:test';

import { createEditor } from '../../../../core';
import { setEditorReadOnly } from '../../../../facade';
import {
  BasePlaceholderPlugin,
  UploadErrorCode,
  type MediaUploadResult,
} from './BasePlaceholderPlugin';

const deferred = () => {
  let resolve!: (value: MediaUploadResult) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<MediaUploadResult>(
    (resolveRequest, rejectRequest) => {
      resolve = resolveRequest;
      reject = rejectRequest;
    }
  );
  return { promise, resolve, reject };
};
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('placeholder upload lifetime', () => {
  it('validates a direct upload before starting or replacing another task', () => {
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            uploadConfig: { image: { mediaType: 'image', maxFileSize: '1KB' } },
            upload: () => {
              calls += 1;
              return new Promise(() => {});
            },
          },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'image', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    const key = editor.key([0])!;
    owner.api.upload(key, new File(['ok'], 'ok.png', { type: 'image/png' }));
    const task = owner.store.get('uploadTask', key);
    owner.api.upload(
      key,
      new File(['x'.repeat(2048)], 'large.png', { type: 'image/png' })
    );
    expect(calls).toBe(1);
    expect(owner.store.get('error')?.code).toBe(UploadErrorCode.TOO_LARGE);
    expect(owner.store.get('uploadTask', key)).toBe(task);
    owner.api.upload(
      key,
      new File(['text'], 'text.txt', { type: 'text/plain' })
    );
    expect(calls).toBe(1);
    expect(owner.store.get('error')?.code).toBe(
      UploadErrorCode.INVALID_FILE_TYPE
    );
    owner.api.cancelUpload(key);
  });

  it('applies batch counts to insertion without rejecting a single existing placeholder retry', () => {
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            uploadConfig: { image: { mediaType: 'image', minFileCount: 2 } },
            upload: () => {
              calls += 1;
              return new Promise(() => {});
            },
          },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'image', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    owner.update.insertMedia([file]);
    expect(owner.store.get('error')?.code).toBe(UploadErrorCode.TOO_LESS_FILES);
    expect(calls).toBe(0);
    const key = editor.key([0])!;
    owner.api.upload(key, file);
    expect(calls).toBe(1);
    expect(owner.store.get('error')).toBeNull();
    owner.api.cancelUpload(key);
  });

  it('reports a missing transport as a failed task without throwing or replacing the placeholder', () => {
    const editor = createEditor({
      plugins: [BasePlaceholderPlugin],
      initialValue: [
        { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    const key = editor.key([0])!;
    expect(() => owner.api.upload(key, new File(['x'], 'x.txt'))).not.toThrow();
    expect(owner.store.get('uploadTask', key)?.getSnapshot()).toMatchObject({
      status: 'error',
      error: expect.any(Error),
    });
    expect(editor.read.children()[0].type).toBe('placeholder');
  });
  it('starts committed insertions and completes without any mounted view or image load', async () => {
    const request = deferred();
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: { upload: () => request.promise },
        }),
      ],
    });
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const owner = editor.plugin(BasePlaceholderPlugin);
    owner.update.insertMedia([file], { at: [1] });
    const key = editor.key([1])!;
    expect(owner.store.get('uploadTask', key)?.file).toBe(file);
    request.resolve({
      url: 'https://example.test/image.png',
      naturalWidth: 640,
      naturalHeight: 360,
    });
    await settle();
    expect(editor.read.children()[1]).toMatchObject({
      type: 'image',
      url: 'https://example.test/image.png',
      naturalWidth: 640,
      naturalHeight: 360,
    });
    expect(owner.store.get('uploadTask', key)).toBeUndefined();
  });

  it('replaces an explicit empty source and aborts its upload on undo', () => {
    const request = deferred();
    let signal: AbortSignal | undefined;
    const initialValue = [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'keep' }] },
    ];
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            upload: (_file, options) => {
              ({ signal } = options);
              return request.promise;
            },
          },
        }),
      ],
      initialValue,
      selection: {
        kind: 'text',
        anchor: { path: [1, 0], offset: 2 },
        focus: { path: [1, 0], offset: 2 },
      },
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const version = editor.read.lastCommit()?.version ?? 0;
    owner.update.insertMedia([file], {
      after: editor.key([0])!,
      replaceEmpty: true,
      select: true,
    });
    expect(editor.read.children()).toMatchObject([
      { type: 'placeholder', mediaType: 'image' },
      initialValue[1],
    ]);
    expect(editor.read.children()).toHaveLength(2);
    expect(editor.read.lastCommit()?.version).toBe(version + 1);
    expect(editor.read.selection()?.anchor.path[0]).toBe(0);
    expect(owner.store.get('uploadTask', editor.key([0])!)?.file).toBe(file);
    expect(signal?.aborted).toBe(false);
    editor.update.history.undo();
    expect(editor.read.children()).toEqual(initialValue);
    expect(signal?.aborted).toBe(true);
  });

  it('never starts an upload from an aborted document transaction', () => {
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            upload: async () => {
              calls += 1;
              return { url: 'https://example.test/a' };
            },
          },
        }),
      ],
    });
    expect(() =>
      editor.update((tx) => {
        tx.placeholder.insertMedia([new File(['x'], 'x.txt')]);
        throw new Error('abort');
      })
    ).toThrow('abort');
    expect(calls).toBe(0);
    expect(editor.plugin(BasePlaceholderPlugin).store.get('uploads')).toEqual(
      {}
    );
  });

  it('supersedes a request and ignores its progress and late success', async () => {
    const first = deferred();
    const second = deferred();
    const requests: Array<{
      onProgress: (value: number) => void;
      signal: AbortSignal;
    }> = [];
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            upload: (_file, options) => {
              requests.push(options);
              return requests.length === 1 ? first.promise : second.promise;
            },
          },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    const key = editor.key([0])!;
    owner.api.upload(key, new File(['one'], 'one.txt'));
    const priorTask = owner.store.get('uploadTask', key)!;
    owner.api.upload(key, new File(['two'], 'two.txt'));
    const task = owner.store.get('uploadTask', key)!;
    expect(requests[0].signal.aborted).toBe(true);
    requests[0].onProgress(75);
    first.resolve({ url: 'https://example.test/old' });
    await settle();
    expect(task.getSnapshot().progress).toBe(0);
    expect(priorTask.getSnapshot().progress).toBe(0);
    expect(editor.read.children()[0].type).toBe('placeholder');
    requests[1].onProgress(35);
    expect(task.getSnapshot().progress).toBe(35);
    second.resolve({ url: 'https://example.test/new' });
    await settle();
    expect(editor.read.children()[0]).toMatchObject({
      type: 'file',
      name: 'two.txt',
      url: 'https://example.test/new',
    });
  });

  it('cancels a request before accepting a late result', async () => {
    const request = deferred();
    let signal: AbortSignal | undefined;
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            upload: (_file, options) => {
              ({ signal } = options);
              return request.promise;
            },
          },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    const key = editor.key([0])!;
    owner.api.upload(key, new File(['x'], 'x.txt'));
    owner.api.cancelUpload(key);
    expect(signal?.aborted).toBe(true);
    request.resolve({ url: 'https://example.test/late' });
    await settle();
    expect(editor.read.children()[0].type).toBe('placeholder');
    expect(owner.store.get('uploads')).toEqual({});
  });

  it('aborts a removed node and never replaces the node that takes its path', async () => {
    const request = deferred();
    let signal: AbortSignal | undefined;
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            upload: (_file, options) => {
              ({ signal } = options);
              return request.promise;
            },
          },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    owner.api.upload(editor.key([0])!, new File(['x'], 'x.txt'));
    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.insert(
        { type: 'paragraph', children: [{ text: 'replacement' }] },
        { at: [0] }
      );
    });
    expect(signal?.aborted).toBe(true);
    request.resolve({ url: 'https://example.test/late' });
    await settle();
    expect(editor.read.children()[0]).toMatchObject({
      type: 'paragraph',
      children: [{ text: 'replacement' }],
    });
  });

  it('does not upload through a readonly editor', () => {
    let calls = 0;
    const editor = createEditor({
      readOnly: true,
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            upload: async () => {
              calls += 1;
              return { url: 'https://example.test/a' };
            },
          },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
      ],
    });
    editor
      .plugin(BasePlaceholderPlugin)
      .api.upload(editor.key([0])!, new File(['x'], 'x.txt'));
    expect(calls).toBe(0);
    expect(editor.plugin(BasePlaceholderPlugin).store.get('uploads')).toEqual(
      {}
    );
  });

  it('retains a failed placeholder and reports the real error', async () => {
    const request = deferred();
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: { upload: () => request.promise },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    const key = editor.key([0])!;
    owner.api.upload(key, new File(['x'], 'x.txt'));
    const task = owner.store.get('uploadTask', key)!;
    const error = new Error('upload rejected');
    request.reject(error);
    await settle();
    expect(task.getSnapshot()).toMatchObject({ status: 'error', error });
    expect(editor.read.children()[0]).toMatchObject({ type: 'placeholder' });
    expect(editor.read.children()[0]).not.toHaveProperty('url');
    editor.update.nodes.remove({ at: [0] });
    expect(owner.store.get('uploads')).toEqual({});
  });

  it('refuses a result after the editor becomes readonly', async () => {
    const request = deferred();
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: { upload: () => request.promise },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    owner.api.upload(editor.key([0])!, new File(['x'], 'x.txt'));
    setEditorReadOnly(editor, true);
    request.resolve({ url: 'https://example.test/late' });
    await settle();
    expect(editor.read.children()[0].type).toBe('placeholder');
    expect(owner.store.get('uploads')).toEqual({});
  });

  it('never uses the manual replacement command on another node type', () => {
    const editor = createEditor({
      plugins: [BasePlaceholderPlugin],
      initialValue: [{ type: 'paragraph', children: [{ text: 'keep' }] }],
    });
    editor
      .plugin(BasePlaceholderPlugin)
      .update.replaceMedia(
        { plugin: 'image', url: 'https://example.test/a' },
        { at: [0] }
      );
    expect(editor.read.children()[0]).toMatchObject({
      type: 'paragraph',
      children: [{ text: 'keep' }],
    });
  });

  it('does not restart or lose progress when a subscriber remounts', async () => {
    const request = deferred();
    let calls = 0;
    let progress: ((value: number) => void) | undefined;
    const editor = createEditor({
      plugins: [
        BasePlaceholderPlugin.configure({
          initialState: {
            upload: (_file, options) => {
              calls += 1;
              progress = options.onProgress;
              return request.promise;
            },
          },
        }),
      ],
      initialValue: [
        { type: 'placeholder', mediaType: 'file', children: [{ text: '' }] },
      ],
    });
    const owner = editor.plugin(BasePlaceholderPlugin);
    const key = editor.key([0])!;
    owner.api.upload(key, new File(['x'], 'x.txt'));
    const task = owner.store.get('uploadTask', key)!;
    let wakes = 0;
    const unmount = task.subscribe(() => {
      wakes += 1;
    });
    progress?.(25);
    unmount();
    progress?.(50);
    const remountedTask = owner.store.get('uploadTask', key)!;
    expect(remountedTask).toBe(task);
    expect(remountedTask.getSnapshot().progress).toBe(50);
    expect(wakes).toBe(1);
    expect(calls).toBe(1);
    request.resolve({ url: 'https://example.test/done' });
    await settle();
    expect(editor.read.children()[0].type).toBe('file');
  });
});
