import { describe, expect, it, mock, spyOn } from 'bun:test';

import { createFilesClient } from 'files-sdk/client';

import { createEditor } from '../../../core';
import { BaseImagePlugin } from '../../../features/media/lib/image/BaseImagePlugin';
import type {
  UploadFailure,
  UploadRules,
} from '../../../features/upload/lib/BaseUploadPlugin';
import { pipeHandler } from '../../utils/pipeHandler.internal';
import { UploadPlugin } from './UploadPlugin';

const createDropEvent = () => {
  const preventDefault = mock();
  const stopPropagation = mock();

  return {
    event: {
      dataTransfer: {
        files: [new File(['image'], 'image.png', { type: 'image/png' })],
      },
      nativeEvent: {},
      preventDefault,
      stopPropagation,
    } as unknown as React.DragEvent,
    preventDefault,
    stopPropagation,
  };
};

const client = createFilesClient({
  endpoint: 'https://example.test/api/files',
});
Object.assign(client, { upload: async () => new Promise(() => {}) });

const configured = (
  state: {
    nativeDrop?: boolean;
    onError?: (failure: UploadFailure) => void;
    rules?: UploadRules;
  } = {}
) =>
  UploadPlugin.configure({
    initialState: { client, getUrl: ({ key }) => key, ...state },
  });

const createSelectedEditor = (plugin = UploadPlugin, text = '') =>
  createEditor({
    plugins: [BaseImagePlugin, plugin],
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text',
    },
    initialValue: [{ children: [{ text }], type: 'paragraph' }],
  });

describe('UploadPlugin', () => {
  it('allows editable UI to replace the headless null renderer', () => {
    const Component = () => null;
    const editor = createEditor({
      plugins: [UploadPlugin.configure({ component: Component })],
    });

    expect(editor.plugin(UploadPlugin).component).toBe(Component);
  });

  it('leaves native file drops to the DnD owner by default', () => {
    const editor = createSelectedEditor();
    const { event, preventDefault, stopPropagation } = createDropEvent();

    pipeHandler(editor, { handlerKey: 'onDrop' })?.(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(stopPropagation).not.toHaveBeenCalled();
  });

  it('admits native file drops when explicitly enabled', () => {
    const editor = createSelectedEditor(configured({ nativeDrop: true }));
    const { event, preventDefault, stopPropagation } = createDropEvent();
    spyOn(editor.api.dom, 'resolveEventRange').mockReturnValue({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text',
    });

    pipeHandler(editor, { handlerKey: 'onDrop' })?.(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(editor.read.children()).toMatchObject([
      { kind: 'image', type: 'upload' },
    ]);
  });

  it('preserves an empty block when clipboard admission rejects the file', () => {
    const failures: UploadFailure[] = [];
    const editor = createSelectedEditor(
      configured({
        onError: (failure) => failures.push(failure),
        rules: { image: { kind: 'image' } },
      })
    );
    const data = {
      files: [new File(['text'], 'note.txt')],
      getData: () => '',
      types: [],
    };

    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    expect(failures).toEqual([
      expect.objectContaining({
        code: 'unsupported-file-type',
        phase: 'admission',
      }),
    ]);
  });

  it('replaces an empty clipboard target and keeps nonempty content', () => {
    const plugin = configured();
    const empty = createSelectedEditor(plugin);
    const populated = createSelectedEditor(plugin, 'keep');
    const data = {
      files: [new File(['image'], 'image.png', { type: 'image/png' })],
      getData: () => '',
      types: [],
    };

    empty.api.dom.clipboard.insertData(data as unknown as DataTransfer);
    populated.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    expect(empty.read.children()).toMatchObject([
      { kind: 'image', type: 'upload' },
    ]);
    expect(populated.read.children()).toMatchObject([
      { children: [{ text: 'keep' }], type: 'paragraph' },
      { kind: 'image', type: 'upload' },
    ]);
  });

  it('associates each submitted file with its own committed slot', () => {
    const editor = createSelectedEditor(configured());
    const first = new File(['first'], 'first.png', { type: 'image/png' });
    const second = new File(['second'], 'second.png', { type: 'image/png' });

    editor.plugin(UploadPlugin).update.submit([first, second], { at: [1] });

    const owner = editor.plugin(UploadPlugin);
    expect(owner.store.get('task', editor.key([1])!)?.file).toBe(first);
    expect(owner.store.get('task', editor.key([2])!)?.file).toBe(second);
  });
});
