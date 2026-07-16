import { createBaseEditor } from '@platejs/core';

import { DocxExportPlugin } from './docx-export-plugin';

describe('DocxExportPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('exports and downloads through the typed plugin API', async () => {
    const editor = createBaseEditor({
      plugins: [DocxExportPlugin],
      value: [{ children: [{ text: 'Export me' }], type: 'p' }],
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

    await editor.api.docxExport.exportAndDownload('document', {
      orientation: 'landscape',
    });

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:docx');
    expect(document.querySelector('a[download="document.docx"]')).toBeNull();
  });
});
