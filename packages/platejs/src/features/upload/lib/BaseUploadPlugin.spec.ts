import { describe, expect, it } from 'bun:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  definePlugin,
  schema,
} from '../../../core';
import { writeDataTransferFragment } from '../../../dom';
import { BaseColumnPlugin } from '../../layout/lib/BaseColumnPlugin';
import { BaseUploadPlugin } from './BaseUploadPlugin';

describe('BaseUploadPlugin', () => {
  it('defines a strict block-void draft slot', () => {
    const editor = createEditor({ plugins: [BaseUploadPlugin] });
    const element = editor.read.schema.element(BaseUploadPlugin);

    expect(element?.behavior.void).toBe(true);
    expect(element?.behavior.voidKind).toBe('block');
    expect(element?.groups).toContain('block');
    expect(() =>
      editor
        .plugin(BaseUploadPlugin)
        .update.insert({ kind: 'image' }, { at: [1] })
    ).not.toThrow();
    expect(editor.read.children().at(-1)).toMatchObject({
      kind: 'image',
      type: 'upload',
    });
  });

  it('preserves draft intent internally and omits it from external HTML', () => {
    const editor = createEditor({
      plugins: [BaseUploadPlugin],
      initialValue: [
        { children: [{ text: 'before' }], type: 'paragraph' },
        { children: [{ text: '' }], kind: 'image', type: 'upload' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });
    const sourceKey = editor.key([1]);
    const slice = ContentSlice.closed(editor.read.children());
    const output = new DataTransfer();

    writeDataTransferFragment(editor, output, slice);

    expect(slice.content[1]).toEqual({
      children: [{ text: '' }],
      kind: 'image',
      type: 'upload',
    });
    expect(output.getData('text/html')).toBe('<p>before</p><p>after</p>');
    expect(output.getData('text/plain')).not.toContain('upload');

    const copied = ContentSlice.fromJSON(
      JSON.parse(JSON.stringify(slice)) as unknown
    );
    const target = createEditor({
      plugins: [BaseUploadPlugin],
      initialValue: copied.content,
    });

    expect(target.read.children()[1]).toEqual({
      children: [{ text: '' }],
      kind: 'image',
      type: 'upload',
    });
    expect(target.key([1])).not.toBe(sourceKey);
    expect(target.plugin(BaseUploadPlugin).store.get('tasks')).toEqual({});
  });

  it.each([
    ['maxFiles', { maxFiles: 0 }],
    ['maxBytes', { rules: { image: { kind: 'image', maxBytes: 0 } } }],
    ['minFiles', { rules: { image: { kind: 'image', minFiles: 0 } } }],
    [
      'range',
      {
        rules: {
          image: { kind: 'image', maxFiles: 1, minFiles: 2 },
        },
      },
    ],
  ] as const)(
    'rejects invalid %s configuration during activation',
    (_, state) => {
      expect(() =>
        createEditor({
          plugins: [
            BaseUploadPlugin.configure({ initialState: state as never }),
          ],
        })
      ).toThrow(/Upload/);
    }
  );
});

describe('upload draft transfer', () => {
  const paragraph = (text: string) => ({
    children: [{ text }],
    type: 'paragraph',
  });
  const card = {
    childRoots: { body: 'card:1' },
    children: [{ text: '' }],
    type: 'card',
  };
  const draft = { children: [{ text: '' }], kind: 'image', type: 'upload' };
  const cardPlugin = (...bodyTypes: string[]) =>
    definePlugin('card', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          contentRoots: {
            body: schema.content.types(['paragraph', ...bodyTypes], {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        },
      },
    });
  const types = (nodes: ReadonlyArray<{ type?: unknown }>) =>
    nodes.map((node) => node.type);

  it('refuses to move a draft across roots', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('top'), card],
        roots: { 'card:1': [draft, paragraph('stays')] },
      } as never,
      plugins: [cardPlugin('upload'), BaseUploadPlugin],
    });
    const body = createEditorView(editor, { root: 'card:1' });

    expect(
      editor.api.transfer.move({
        from: body,
        nodes: [body.key([0])!],
        to: { edge: 'before', key: editor.key([0])! },
      }).status
    ).toBe('refused');
    expect(types(editor.read.root('card:1'))).toEqual(['upload', 'paragraph']);
  });

  it('keeps the draft veto when a column admits the landing', () => {
    const editor = createEditor({
      initialValue: {
        children: [draft, card],
        roots: {
          'card:1': [
            {
              children: ['a', 'b'].map((text) => ({
                children: [paragraph(text)],
                type: 'column',
                width: '50%',
              })),
              type: 'columnGroup',
            },
          ],
        },
      } as never,
      plugins: [
        cardPlugin('columnGroup', 'upload'),
        BaseColumnPlugin,
        BaseUploadPlugin,
      ],
    });
    const body = createEditorView(editor, { root: 'card:1' });

    expect(
      body.api.transfer.move({
        from: editor,
        nodes: [editor.key([0])!],
        to: { edge: 'after', key: body.key([0, 0, 0])! },
      }).status
    ).toBe('refused');
    expect(types(editor.read.children())).toEqual(['upload', 'card']);
  });
});
