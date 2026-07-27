import { createBaseEditor, createBasePlugin } from '@platejs/core';

import { DocxIOPlugin, downloadDocx } from './DocxIOPlugin';

describe('DocxIOPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('converts an explicit document snapshot and downloads separately', async () => {
    const editor = createBaseEditor({
      plugins: [DocxIOPlugin],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'p' }],
    });
    const createObjectUrl = spyOn(URL, 'createObjectURL').mockReturnValue(
      'blob:docx'
    );
    const revokeObjectUrl = spyOn(URL, 'revokeObjectURL').mockImplementation(
      () => {}
    );
    const click = spyOn(
      HTMLAnchorElement.prototype,
      'click'
    ).mockImplementation(() => {});

    const blob = await editor
      .plugin(DocxIOPlugin)
      .api.toBlob(editor.read.children(), { orientation: 'landscape' });

    downloadDocx(blob, 'document');

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:docx');
    expect(document.querySelector('a[download="document.docx"]')).toBeNull();
  });

  it('resolves configured plugin references for the export editor', async () => {
    const SerializationPlugin = createBasePlugin({ key: 'serialization' });
    const editor = createBaseEditor({
      plugins: [
        SerializationPlugin,
        DocxIOPlugin.configure({
          initialState: { editorPlugins: [SerializationPlugin] },
        }),
      ],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'p' }],
    });

    await expect(
      editor.plugin(DocxIOPlugin).api.toBlob(editor.read.children())
    ).resolves.toBeInstanceOf(Blob);
  });
});
