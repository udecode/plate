import { describe, expect, it } from 'bun:test';

import { ContentSlice, createEditor } from '../../../core';
import { writeHostFragmentData } from '../../../dom';
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

    writeHostFragmentData(editor, output, slice);

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
