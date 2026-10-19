import { describe, expect, it, mock, spyOn } from 'bun:test';

import { createFilesClient } from 'files-sdk/client';

import { createEditor } from '../../../core';
import { BaseDetailsPlugin } from '../../../features/details/lib/BaseDetailsPlugin';
import { BaseImagePlugin } from '../../../features/media/lib/image/BaseImagePlugin';
import type {
  UploadFailure,
  UploadRules,
} from '../../../features/upload/lib/BaseUploadPlugin';
import { pipeHandler } from '../../utils/pipeHandler.internal';
import { UploadPlugin } from './UploadPlugin';

const createDropEvent = (types = ['Files']) => {
  const preventDefault = mock();
  const stopPropagation = mock();

  return {
    event: {
      dataTransfer: {
        dropEffect: 'none',
        files: types.includes('Files')
          ? [new File(['image'], 'image.png', { type: 'image/png' })]
          : [],
        types,
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

  it('lands a file drop at the resolved edge with no drop configuration', () => {
    const editor = createSelectedEditor(configured());
    const { event, preventDefault, stopPropagation } = createDropEvent();
    spyOn(editor.api.dom, 'resolveDropTarget').mockReturnValue({
      edge: 'after',
      key: editor.key([0])!,
    });

    pipeHandler(editor, { handlerKey: 'onDrop' })?.(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(editor.read.children()).toMatchObject([
      { kind: 'image', type: 'upload' },
    ]);
  });

  it('accepts a file drag with no drop configuration', () => {
    const editor = createSelectedEditor(configured());
    const { event, preventDefault } = createDropEvent();
    spyOn(editor.api.dom, 'resolveDropTarget').mockReturnValue({
      edge: 'after',
      key: editor.key([0])!,
    });

    pipeHandler(editor, { handlerKey: 'onDragOver' })?.(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(event.dataTransfer.dropEffect).toBe('copy');
  });

  it('uploads the files of a drop that also carries HTML', () => {
    const editor = createSelectedEditor(configured());
    const { event } = createDropEvent(['Files', 'text/html']);
    spyOn(editor.api.dom, 'resolveDropTarget').mockReturnValue({
      edge: 'after',
      key: editor.key([0])!,
    });

    pipeHandler(editor, { handlerKey: 'onDrop' })?.(event);

    expect(editor.read.children()).toMatchObject([
      { kind: 'image', type: 'upload' },
    ]);
  });

  it('passes a drag without files through', () => {
    const editor = createSelectedEditor(configured());
    const { event, preventDefault } = createDropEvent(['text/html']);

    const handled = pipeHandler(editor, { handlerKey: 'onDrop' })?.(event);

    expect(handled).toBeFalsy();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('consumes a refused file landing without an upload', () => {
    const editor = createSelectedEditor(configured());
    const { event, preventDefault } = createDropEvent();
    spyOn(editor.api.dom, 'resolveDropTarget').mockReturnValue(null);

    const handled = pipeHandler(editor, { handlerKey: 'onDrop' })?.(event);

    expect(handled).toBe(true);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
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

  it('keeps an empty details summary when a file drops after it', () => {
    const editor = createEditor({
      plugins: [BaseImagePlugin, BaseDetailsPlugin, configured()],
      initialValue: [
        {
          children: [
            { children: [{ text: '' }], type: 'summary' },
            { children: [{ text: 'body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });
    const summary = editor.key([0, 0])!;

    editor
      .plugin(UploadPlugin)
      .update.submit(
        [new File(['image'], 'image.png', { type: 'image/png' })],
        {
          after: summary,
          replaceEmpty: true,
        }
      );

    expect(editor.read.nodes.get(summary)?.[1]).toEqual([0, 0]);
    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { type: 'summary' },
        { type: 'upload' },
        { type: 'paragraph' },
      ],
    });
  });

  it('submits a file from a closed details title after the section', () => {
    const editor = createEditor({
      plugins: [BaseImagePlugin, BaseDetailsPlugin, configured()],
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
        { children: [{ text: 'After' }], type: 'paragraph' },
      ],
    });

    editor.update.selection.set({ offset: 5, path: [0, 0, 0] });
    editor
      .plugin(UploadPlugin)
      .update.submit([new File(['image'], 'image.png', { type: 'image/png' })]);

    expect(
      editor.read
        .children()
        .map((node) =>
          node.type === 'details'
            ? node.children.map((child) => child.type)
            : node.type
        )
    ).toEqual([['summary', 'paragraph'], 'upload', 'paragraph']);
  });

  it.each([
    ['open', true, ['summary', 'upload', 'paragraph'], ['details']],
    ['closed', false, ['summary', 'paragraph'], ['details', 'upload']],
  ])(
    'keeps an empty %s details summary when a file is pasted in it',
    (_, open, sectionChildren, topLevel) => {
      const editor = createEditor({
        plugins: [BaseImagePlugin, BaseDetailsPlugin, configured()],
        initialValue: [
          {
            children: [
              { children: [{ text: '' }], type: 'summary' },
              { children: [{ text: 'body' }], type: 'paragraph' },
            ],
            type: 'details',
          },
        ],
      });
      const summary = editor.key([0, 0])!;

      if (open) {
        editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
      }
      editor.update.selection.set({ offset: 0, path: [0, 0, 0] });
      editor.api.dom.clipboard.insertData({
        files: [new File(['image'], 'image.png', { type: 'image/png' })],
        getData: () => '',
        types: [],
      } as unknown as DataTransfer);

      expect(editor.read.nodes.get(summary)?.[1]).toEqual([0, 0]);
      expect(editor.read.children().map((node) => node.type)).toEqual(topLevel);
      expect(
        editor.read.children()[0].children.map((node) => node.type)
      ).toEqual(sectionChildren);
    }
  );
});
