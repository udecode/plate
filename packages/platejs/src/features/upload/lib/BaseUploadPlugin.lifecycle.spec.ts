import { describe, expect, it } from 'bun:test';

import { AuthoredPlugin } from '../../../authored';
import {
  createEditor,
  createEditorView,
  definePlugin,
  schema,
} from '../../../core';
import { domCommands } from '../../../dom/plite-dom.internal';
import { setEditorReadOnly } from '../../../facade';
import { BaseDetailsPlugin } from '../../details';
import { BaseFilePlugin } from '../../media/lib/BaseMediaPlugin';
import { BaseImagePlugin } from '../../media/lib/image/BaseImagePlugin';
import {
  BaseUploadPlugin,
  type UploadFailure,
  type UploadClient,
  type UploadPluginState,
} from './BaseUploadPlugin';

type TestUploadResult = {
  url: string;
  naturalHeight?: number;
  naturalWidth?: number;
};
type TestUpload = (
  file: File,
  options: { signal: AbortSignal; onProgress: (value: number) => void }
) => Promise<TestUploadResult>;

const withUpload = ({
  initialState,
}: {
  initialState: Partial<UploadPluginState> & { upload?: TestUpload };
}) => {
  const { upload, ...state } = initialState;
  const client: UploadClient | null = upload
    ? {
        upload: async (file, options) => {
          const result = await upload(file, {
            signal: options?.signal ?? new AbortController().signal,
            onProgress: (value) =>
              options?.onProgress?.(
                { fraction: value / 100, loaded: value, total: 100 },
                []
              ),
          });
          return { key: result.url, size: file.size, type: file.type };
        },
      }
    : null;
  return BaseUploadPlugin.configure({
    initialState: { ...state, client, getUrl: ({ key }) => key },
  });
};

const deferred = () => {
  let resolve!: (value: TestUploadResult) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<TestUploadResult>(
    (resolveRequest, rejectRequest) => {
      resolve = resolveRequest;
      reject = rejectRequest;
    }
  );

  return { promise, reject, resolve };
};

const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const paragraph = (text = '') => ({
  children: [{ text }],
  type: 'paragraph',
});

const slot = (kind: 'audio' | 'file' | 'image' | 'video') => ({
  children: [{ text: '' }],
  kind,
  type: 'upload',
});

const UploadRootHolderPlugin = definePlugin('uploadRootHolder', {
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        body: {
          content: schema.content.types(['image', 'upload', 'paragraph']),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
});

describe('Files admission and lifetime', () => {
  it('pastes a file after the closed Details in the caret root', () => {
    const Note = definePlugin('uploadDetailsNote', {
      schema: {
        element: {
          void: 'block',
          contentRoots: {
            body: schema.content.group('block', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        },
      },
    });
    const editor = createEditor({
      plugins: [
        BaseDetailsPlugin,
        BaseImagePlugin,
        Note,
        withUpload({
          initialState: {
            rules: { image: { kind: 'image' } },
            upload: () => new Promise(() => {}),
          },
        }),
      ],
      initialValue: {
        children: [
          {
            type: 'uploadDetailsNote',
            childRoots: { body: 'note' },
            children: [{ text: '' }],
          },
        ],
        roots: {
          note: [
            {
              type: 'details',
              children: [
                { type: 'summary', children: [{ text: 'Title' }] },
                paragraph('Body'),
              ],
            },
            paragraph('After'),
          ],
        },
      },
    });
    const main = editor.read.children();
    const details = editor.read.root('note')[0];
    editor.update.selection.set({ path: [0, 0, 0], offset: 5, root: 'note' });
    const data = new DataTransfer();
    data.items.add(new File(['image'], 'image.png', { type: 'image/png' }));

    editor.update((tx) => {
      tx.command(domCommands.insertData, data);
    });

    expect({
      main: editor.read.children(),
      note: editor.read.root('note'),
    }).toEqual({
      main,
      note: [details, slot('image'), paragraph('After')],
    });
  });

  it('rejects a batch atomically and reports the failure once after commit', () => {
    const failures: UploadFailure[] = [];
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            onError: (failure) => failures.push(failure),
            rules: { image: { kind: 'image' } },
            upload: async () => ({ url: 'https://example.test/image.png' }),
          },
        }),
      ],
      initialValue: [paragraph()],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const before = editor.read.value();

    expect(
      owner.update.submit([new File(['text'], 'note.txt')], {
        after: editor.key([0])!,
        replaceEmpty: true,
      })
    ).toBe(true);
    expect(editor.read.value()).toEqual(before);
    expect(owner.store.get('tasks')).toEqual({});
    expect(failures).toEqual([
      expect.objectContaining({
        code: 'unsupported-file-type',
        phase: 'admission',
      }),
    ]);
  });

  it('reports missing client without inserting a slot or creating a task', () => {
    const failures: UploadFailure[] = [];
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: { onError: (failure) => failures.push(failure) },
        }),
      ],
      initialValue: [paragraph('keep')],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const before = editor.read.value();

    expect(owner.update.submit([new File(['x'], 'x.txt')])).toBe(true);
    expect(editor.read.value()).toEqual(before);
    expect(owner.store.get('tasks')).toEqual({});
    expect(failures).toEqual([
      expect.objectContaining({
        code: 'missing-client',
        phase: 'configuration',
      }),
    ]);
  });

  it('completes a committed slot by key and maps completion through history', async () => {
    const request = deferred();
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: () => {
              calls += 1;
              return request.promise;
            },
          },
        }),
      ],
      initialValue: [paragraph()],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const initialValue = editor.read.children();

    expect(
      owner.update.submit(
        [new File(['image'], 'image.png', { type: 'image/png' })],
        { after: editor.key([0])!, replaceEmpty: true }
      )
    ).toBe(true);
    const key = editor.key([0])!;
    const childKey = editor.key([0, 0])!;

    expect(owner.store.get('task', key)?.file.name).toBe('image.png');
    const bitmapDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'createImageBitmap'
    );
    Object.defineProperty(globalThis, 'createImageBitmap', {
      configurable: true,
      value: async () => ({ close() {}, height: 360, width: 640 }),
    });
    try {
      request.resolve({ url: 'https://example.test/image.png' });
      await settle();
    } finally {
      if (bitmapDescriptor) {
        Object.defineProperty(
          globalThis,
          'createImageBitmap',
          bitmapDescriptor
        );
      } else {
        Reflect.deleteProperty(globalThis, 'createImageBitmap');
      }
    }

    expect(editor.read.children()[0]).toMatchObject({
      naturalHeight: 360,
      naturalWidth: 640,
      type: 'image',
      url: 'https://example.test/image.png',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('kind');
    expect(editor.key([0])).toBe(key);
    expect(editor.key([0, 0])).toBe(childKey);
    expect(owner.store.get('task', key)).toBeUndefined();

    editor.api.history.undo();
    expect(editor.read.children()).toEqual(initialValue);
    editor.api.history.redo();
    expect(editor.read.children()[0]).toMatchObject({
      type: 'image',
      url: 'https://example.test/image.png',
    });
    expect(calls).toBe(1);
  });

  it('retries through the authored view that admitted the draft', async () => {
    const requests = [deferred(), deferred()];
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: () => {
              const request = requests[calls];
              calls += 1;

              return request.promise;
            },
          },
        }),
        AuthoredPlugin,
      ],
      initialValue: [paragraph()],
      userId: 'alice',
    });
    const view = createEditorView(editor, {
      authored: { intent: 'edit' },
    });
    const owner = view.plugin(BaseUploadPlugin);

    const firstFile = new File(['first'], 'first.png', { type: 'image/png' });
    const secondFile = new File(['second'], 'second.png', {
      type: 'image/png',
    });

    expect(
      owner.update.submit([firstFile], {
        after: view.key([0])!,
        replaceEmpty: true,
      })
    ).toBe(true);
    requests[0].reject(new Error('first upload failed'));
    await settle();
    const key = view.key([0])!;

    expect(owner.store.get('task', key)?.getSnapshot()).toMatchObject({
      status: 'failed',
    });
    expect(owner.update.submit([secondFile], { slot: key })).toBe(true);
    requests[1].resolve({ url: 'https://example.test/image.png' });
    await settle();

    expect(view.read.children()[0]).toMatchObject({
      type: 'image',
      url: 'https://example.test/image.png',
    });
    expect(owner.store.get('task', view.key([0])!)).toBeUndefined();
    expect(calls).toBe(2);
  });

  it('completes every draft admitted through an authored view', async () => {
    const requests = [deferred(), deferred(), deferred()];
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: () => {
              const request = requests[calls];
              calls += 1;

              return request.promise;
            },
          },
        }),
        AuthoredPlugin,
      ],
      initialValue: [paragraph('target')],
      userId: 'alice',
    });
    const view = createEditorView(editor, {
      authored: { intent: 'edit' },
    });
    const owner = view.plugin(BaseUploadPlugin);

    expect(
      owner.update.submit(
        [
          new File(['one'], 'one.png', { type: 'image/png' }),
          new File(['two'], 'two.png', { type: 'image/png' }),
          new File(['three'], 'three.png', { type: 'image/png' }),
        ],
        { after: view.key([0])!, replaceEmpty: true }
      )
    ).toBe(true);
    expect(calls).toBe(3);

    requests[0].resolve({ url: 'https://example.test/one.png' });
    await settle();
    expect(view.read.children()).toMatchObject([
      { type: 'paragraph' },
      { type: 'image', url: 'https://example.test/one.png' },
      { kind: 'image', type: 'upload' },
      { kind: 'image', type: 'upload' },
    ]);
    expect(Object.keys(owner.store.get('tasks'))).toHaveLength(2);

    requests[1].resolve({ url: 'https://example.test/two.png' });
    requests[2].resolve({ url: 'https://example.test/three.png' });
    await settle();

    expect(view.read.children()).toMatchObject([
      { type: 'paragraph' },
      { type: 'image', url: 'https://example.test/one.png' },
      { type: 'image', url: 'https://example.test/two.png' },
      { type: 'image', url: 'https://example.test/three.png' },
    ]);
    expect(owner.store.get('tasks')).toEqual({});
  });

  it('completes with the installed media schema type', async () => {
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: async () => ({
              url: 'https://example.test/custom-image.png',
            }),
          },
        }),
      ],
      schema: {
        overrides: [
          schema.override(BaseImagePlugin, {
            element: { type: 'customImage' },
          }),
        ],
      },
      initialValue: [slot('image')],
    });

    editor
      .plugin(BaseUploadPlugin)
      .update.submit(
        [new File(['image'], 'image.png', { type: 'image/png' })],
        { slot: editor.key([0])! }
      );
    await settle();

    expect(editor.read.children()[0]).toMatchObject({
      type: 'customImage',
      url: 'https://example.test/custom-image.png',
    });
  });

  it('validates the complete slot batch and requires the first file to match', () => {
    const failures: UploadFailure[] = [];
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            maxFiles: 1,
            onError: (failure) => failures.push(failure),
            rules: {
              image: { kind: 'image' },
              text: { kind: 'file' },
            },
            upload: () => {
              calls += 1;
              return new Promise(() => {});
            },
          },
        }),
      ],
      initialValue: [slot('image')],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const key = editor.key([0])!;
    const image = new File(['image'], 'image.png', { type: 'image/png' });

    expect(owner.update.submit([image, image], { slot: key })).toBe(true);
    expect(failures.at(-1)).toMatchObject({
      code: 'too-many-files',
      phase: 'admission',
    });
    expect(
      owner.update.submit([new File(['text'], 'note.txt')], { slot: key })
    ).toBe(true);
    expect(failures.at(-1)).toMatchObject({
      code: 'unsupported-file-type',
      phase: 'admission',
    });
    expect(calls).toBe(0);
    expect(editor.read.children()).toEqual([slot('image')]);
  });

  it('supersedes an existing task only after the retry transaction commits', () => {
    const first = deferred();
    const second = deferred();
    const signals: AbortSignal[] = [];
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: (_file, options) => {
              signals.push(options.signal);
              return signals.length === 1 ? first.promise : second.promise;
            },
          },
        }),
      ],
      initialValue: [slot('file')],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const key = editor.key([0])!;
    const firstFile = new File(['one'], 'one.txt');
    const secondFile = new File(['two'], 'two.txt');

    owner.update.submit([firstFile], { slot: key });
    const firstTask = owner.store.get('task', key);
    expect(() =>
      editor.update((tx) => {
        tx.upload.submit([secondFile], { slot: key });
        throw new Error('abort retry');
      })
    ).toThrow('abort retry');
    expect(owner.store.get('task', key)).toBe(firstTask);
    expect(signals[0].aborted).toBe(false);
    expect(signals).toHaveLength(1);

    owner.update.submit([secondFile], { slot: key });
    expect(signals[0].aborted).toBe(true);
    expect(signals).toHaveLength(2);
    owner.api.cancel(key);
  });

  it('keeps task authority through a named-root move and completes in that root', async () => {
    const request = deferred();
    const editor = createEditor({
      plugins: [
        UploadRootHolderPlugin,
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: { upload: () => request.promise },
        }),
      ],
      initialValue: {
        children: [
          {
            childRoots: { body: 'header' },
            children: [{ text: '' }],
            type: 'uploadRootHolder',
          },
        ],
        roots: { header: [slot('image'), paragraph('tail')] },
      },
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const header = createEditorView(editor, { root: 'header' });
    const key = header.key([0])!;
    const childKey = header.key([0, 0])!;

    owner.update.submit(
      [new File(['image'], 'image.png', { type: 'image/png' })],
      { slot: key }
    );
    editor.update.nodes.move({ at: key, to: [2] });
    expect(owner.store.get('task', key)).toBeDefined();

    request.resolve({ url: 'https://example.test/header.png' });
    await settle();
    expect(editor.read.children()[0]).toMatchObject({
      childRoots: { body: 'header' },
      type: 'uploadRootHolder',
    });
    expect(header.read.children()[1]).toMatchObject({
      type: 'image',
      url: 'https://example.test/header.png',
    });
    expect(header.key([1])).toBe(key);
    expect(header.key([1, 0])).toBe(childKey);
  });

  it('inserts before a keyed block in the active named root', () => {
    const editor = createEditor({
      plugins: [
        UploadRootHolderPlugin,
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: { upload: () => new Promise(() => {}) },
        }),
      ],
      initialValue: {
        children: [
          {
            childRoots: { body: 'header' },
            children: [{ text: '' }],
            type: 'uploadRootHolder',
          },
        ],
        roots: { header: [paragraph('target')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });
    const key = header.key([0])!;

    header
      .plugin(BaseUploadPlugin)
      .update.submit(
        [new File(['image'], 'image.png', { type: 'image/png' })],
        {
          before: key,
        }
      );

    expect(editor.read.children()).toHaveLength(1);
    expect(header.read.children()).toEqual([
      slot('image'),
      paragraph('target'),
    ]);
    expect(
      editor.plugin(BaseUploadPlugin).store.get('task', header.key([0])!)
    ).toBeDefined();
  });

  it('fills an empty block at the selection and inserts after a non-empty one', () => {
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: { upload: () => new Promise(() => {}) },
        }),
      ],
      initialValue: [paragraph('keep'), paragraph()],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const image = () => new File(['image'], 'image.png', { type: 'image/png' });

    editor.update.selection.set({ offset: 0, path: [1, 0] });
    owner.update.submit([image()]);

    expect(editor.read.children()).toEqual([paragraph('keep'), slot('image')]);

    editor.update.selection.set({ offset: 4, path: [0, 0] });
    owner.update.submit([image()]);

    expect(editor.read.children()).toEqual([
      paragraph('keep'),
      slot('image'),
      slot('image'),
    ]);
  });

  const image = () => new File(['image'], 'image.png', { type: 'image/png' });

  it.each<
    [
      string,
      ReturnType<typeof paragraph> | ReturnType<typeof slot>,
      File[],
      (editor: ReturnType<typeof createEditor>, files: File[]) => boolean,
    ]
  >([
    [
      'at the selection',
      paragraph('keep'),
      [image()],
      (editor, files) => editor.plugin(BaseUploadPlugin).update.submit(files),
    ],
    [
      'before a block',
      paragraph('keep'),
      [image()],
      (editor, files) =>
        editor
          .plugin(BaseUploadPlugin)
          .update.submit(files, { before: editor.key([0, 0])! }),
    ],
    [
      'at a path',
      paragraph('keep'),
      [image()],
      (editor, files) =>
        editor.plugin(BaseUploadPlugin).update.submit(files, { at: [0, 1] }),
    ],
    [
      'into a slot with a second file',
      slot('image'),
      [image(), image()],
      (editor, files) =>
        editor
          .plugin(BaseUploadPlugin)
          .update.submit(files, { slot: editor.key([0, 0])! }),
    ],
  ])(
    'refuses an upload %s that does not fit its parent and reports why',
    (_, child, files, submit) => {
      const failures: UploadFailure[] = [];
      const FullParentPlugin = definePlugin('uploadFullParent', {
        schema: {
          element: {
            blockContent: true,
            content: schema.content.types(['paragraph', 'upload'], { max: 1 }),
          },
        },
      });
      const editor = createEditor({
        plugins: [
          BaseImagePlugin,
          withUpload({
            initialState: {
              onError: (failure) => failures.push(failure),
              upload: () => new Promise(() => {}),
            },
          }),
          FullParentPlugin,
        ],
        initialValue: [{ children: [child], type: 'uploadFullParent' }],
      });

      editor.update.selection.set({ offset: 0, path: [0, 0, 0] });
      const submitted = submit(editor, files);

      expect({
        children: editor.read.children(),
        failures,
        submitted,
        tasks: editor.plugin(BaseUploadPlugin).store.get('tasks'),
      }).toEqual({
        children: [{ children: [child], type: 'uploadFullParent' }],
        failures: [{ code: 'does-not-fit', files, phase: 'placement' }],
        submitted: true,
        tasks: {},
      });
    }
  );

  it('starts the upload a main-root submit lands before a named-root block', () => {
    const editor = createEditor({
      plugins: [
        UploadRootHolderPlugin,
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: { upload: () => new Promise(() => {}) },
        }),
      ],
      initialValue: {
        children: [
          paragraph('main'),
          {
            childRoots: { body: 'header' },
            children: [{ text: '' }],
            type: 'uploadRootHolder',
          },
        ],
        roots: { header: [paragraph('target')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });

    editor
      .plugin(BaseUploadPlugin)
      .update.submit([image()], { before: header.key([0])! });

    expect(header.read.children()).toEqual([
      slot('image'),
      paragraph('target'),
    ]);
    expect(
      editor.plugin(BaseUploadPlugin).store.get('task', header.key([0])!)
    ).toBeDefined();
  });

  it('cancels on identity loss and never grants authority to a reused path', async () => {
    const request = deferred();
    let signal: AbortSignal | undefined;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: (_file, options) => {
              ({ signal } = options);
              return request.promise;
            },
          },
        }),
      ],
      initialValue: [slot('file')],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const key = editor.key([0])!;

    owner.update.submit([new File(['x'], 'x.txt')], { slot: key });
    editor.update((tx) => {
      tx.nodes.remove({ at: key });
      tx.nodes.insert(slot('file'), { at: [0] });
    });
    expect(signal?.aborted).toBe(true);
    expect(owner.store.get('tasks')).toEqual({});

    request.resolve({ url: 'https://example.test/late' });
    await settle();
    expect(editor.read.children()[0]).toEqual(slot('file'));
  });

  it.each([
    ['kind', { kind: 'image' }],
    ['type', { type: 'paragraph' }],
  ] as const)('cancels when a live slot changes %s', (_, properties) => {
    let signal: AbortSignal | undefined;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: (_file, options) => {
              ({ signal } = options);
              return new Promise(() => {});
            },
          },
        }),
      ],
      initialValue: [slot('file')],
    });
    const key = editor.key([0])!;

    editor
      .plugin(BaseUploadPlugin)
      .update.submit([new File(['x'], 'file.txt')], { slot: key });
    editor.update.nodes.set(properties, { at: key });

    expect(signal?.aborted).toBe(true);
    expect(
      editor.plugin(BaseUploadPlugin).store.get('task', key)
    ).toBeUndefined();
  });

  it('turns invalid results into one retryable task-local failure', async () => {
    const failures: UploadFailure[] = [];
    const first = deferred();
    const second = deferred();
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            onError: (failure) => failures.push(failure),
            upload: () => {
              calls += 1;
              return calls === 1 ? first.promise : second.promise;
            },
          },
        }),
      ],
      initialValue: [slot('image')],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const key = editor.key([0])!;
    const file = new File(['image'], 'image.png', { type: 'image/png' });

    owner.update.submit([file], { slot: key });
    first.resolve({ url: '' });
    await settle();
    expect(owner.store.get('task', key)?.getSnapshot()).toMatchObject({
      failure: { phase: 'result', code: 'invalid-url' },
      status: 'failed',
    });
    expect(failures).toHaveLength(1);
    expect(editor.read.children()[0]).toEqual(slot('image'));

    owner.update.submit([file], { slot: key });
    second.resolve({ url: 'https://example.test/retry.png' });
    await settle();
    expect(editor.read.children()[0]).toMatchObject({
      type: 'image',
      url: 'https://example.test/retry.png',
    });
    expect(failures).toHaveLength(1);
  });

  it('blocks new read-only admission but lets an authorized task complete', async () => {
    const request = deferred();
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: () => {
              calls += 1;
              return request.promise;
            },
          },
        }),
      ],
      initialValue: [slot('file')],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const key = editor.key([0])!;

    owner.update.submit([new File(['one'], 'one.txt')], { slot: key });
    setEditorReadOnly(editor, true);
    expect(
      owner.update.submit([new File(['two'], 'two.txt')], { slot: key })
    ).toBe(false);
    expect(calls).toBe(1);

    request.resolve({ url: 'https://example.test/one.txt' });
    await settle();
    expect(editor.read.children()[0]).toMatchObject({
      name: 'one.txt',
      type: 'file',
      url: 'https://example.test/one.txt',
    });
  });

  it('revokes every task on an equal whole-document replacement', () => {
    let signal: AbortSignal | undefined;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: (_file, options) => {
              ({ signal } = options);
              return new Promise(() => {});
            },
          },
        }),
      ],
      initialValue: [slot('file')],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const key = editor.key([0])!;

    owner.update.submit([new File(['x'], 'x.txt')], { slot: key });
    editor.update.value.replace(editor.read.value());

    expect(signal?.aborted).toBe(true);
    expect(owner.store.get('tasks')).toEqual({});
    expect(editor.read.children()).toEqual([slot('file')]);
  });

  it('restores completed and unbound slots without restarting mixed-batch work', async () => {
    const requests = [deferred(), deferred()];
    const signals: AbortSignal[] = [];
    let calls = 0;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: (_file, options) => {
              signals.push(options.signal);
              const request = requests[calls];
              calls += 1;

              return request.promise;
            },
          },
        }),
      ],
      initialValue: [paragraph()],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const initialValue = editor.read.children();
    const files = [
      new File(['one'], 'one.png', { type: 'image/png' }),
      new File(['two'], 'two.png', { type: 'image/png' }),
    ];

    owner.update.submit(files, {
      after: editor.key([0])!,
      replaceEmpty: true,
    });
    requests[0].resolve({ url: 'https://example.test/one.png' });
    await settle();
    expect(editor.read.children()).toMatchObject([
      { type: 'image' },
      { kind: 'image', type: 'upload' },
    ]);

    editor.api.history.undo();
    expect(editor.read.children()).toEqual(initialValue);
    expect(signals[1].aborted).toBe(true);
    editor.api.history.redo();
    expect(editor.read.children()).toMatchObject([
      { type: 'image', url: 'https://example.test/one.png' },
      { kind: 'image', type: 'upload' },
    ]);
    expect(owner.store.get('tasks')).toEqual({});
    expect(calls).toBe(2);
  });

  it('keeps progress and failure state independent of subscribers', async () => {
    const request = deferred();
    let progress: ((value: number) => void) | undefined;
    const editor = createEditor({
      plugins: [
        BaseFilePlugin,
        BaseImagePlugin,
        withUpload({
          initialState: {
            upload: (_file, options) => {
              progress = options.onProgress;
              return request.promise;
            },
          },
        }),
      ],
      initialValue: [slot('file')],
    });
    const owner = editor.plugin(BaseUploadPlugin);
    const key = editor.key([0])!;

    owner.update.submit([new File(['x'], 'x.txt')], { slot: key });
    const task = owner.store.get('task', key)!;
    let wakes = 0;
    const unsubscribe = task.subscribe(() => {
      wakes += 1;
    });
    progress?.(25);
    unsubscribe();
    progress?.(50);

    expect(owner.store.get('task', key)).toBe(task);
    expect(task.getSnapshot()).toEqual({
      progress: { fraction: 0.5, loaded: 50, total: 100 },
      status: 'uploading',
    });
    expect(wakes).toBe(1);
    request.reject(new Error('upload failed'));
    await settle();
    expect(task.getSnapshot()).toMatchObject({ status: 'failed' });
  });
});
