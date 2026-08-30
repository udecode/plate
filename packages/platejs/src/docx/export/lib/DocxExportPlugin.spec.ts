import { createEditor, defineBasePlugin } from '../../../core';
import { DocxExportPlugin, downloadDocx } from './DocxExportPlugin';

describe('DocxExportPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('converts an explicit document snapshot and downloads separately', async () => {
    const editor = createEditor({
      plugins: [DocxExportPlugin],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
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
      .plugin(DocxExportPlugin)
      .api.toBlob(editor.read.children(), { orientation: 'landscape' });

    downloadDocx(blob, 'document');

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:docx');
    expect(document.querySelector('a[download="document.docx"]')).toBeNull();
  });

  it('uses explicit plugin descriptors for the export editor', async () => {
    const SerializationPlugin = defineBasePlugin('serialization', {});
    const editor = createEditor({
      plugins: [SerializationPlugin, DocxExportPlugin],
      initialValue: [{ children: [{ text: 'Export me' }], type: 'paragraph' }],
    });

    const blob = await editor
      .plugin(DocxExportPlugin)
      .api.toBlob(editor.read.children(), {
        editorPlugins: [SerializationPlugin],
      });

    expect(blob).toBeInstanceOf(Blob);
  });
});
