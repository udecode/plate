import { createSlateEditor } from 'platejs';

import {
  DocxExportPlugin,
  type DocxExportApiMethods,
  type DocxExportOperationOptions,
  type DocxExportPluginConfig,
} from './docx-export-plugin';

describe('DocxExportPlugin', () => {
  it('delegates exportAndDownload through the typed plugin API', async () => {
    const editor = createSlateEditor({
      plugins: [DocxExportPlugin],
      value: [{ children: [{ text: 'Export me' }], type: 'p' }],
    });
    const blob = new Blob(['docx']);
    const exportToBlobCalls: (DocxExportOperationOptions | undefined)[] = [];
    const downloadCalls: [Blob, string][] = [];
    const exportToBlob: DocxExportApiMethods['exportToBlob'] = async (
      options
    ) => {
      exportToBlobCalls.push(options);

      return blob;
    };
    const download: DocxExportApiMethods['download'] = (value, filename) => {
      downloadCalls.push([value, filename]);
    };
    const api = editor.getPluginApi<DocxExportPluginConfig>(DocxExportPlugin);
    const transforms =
      editor.getTransforms<DocxExportPluginConfig>(DocxExportPlugin);

    api.docxExport.exportToBlob = exportToBlob;
    api.docxExport.download = download;

    await transforms.docxExport.exportAndDownload('document', {
      orientation: 'landscape',
    });

    expect(exportToBlobCalls).toEqual([
      {
        orientation: 'landscape',
      },
    ]);
    expect(downloadCalls).toEqual([[blob, 'document']]);
  });
});
