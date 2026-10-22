import JSZip from 'jszip';

import { htmlToDocxBlob } from '../html-to-docx.internal';
import { buildImage } from './xml-builder';

describe('renderDocumentFile', () => {
  it('skips webp images before creating media files', async () => {
    const docxDocument = {
      createMediaFile: mock(),
    } as any;

    await expect(
      buildImage(docxDocument, {
        properties: { src: 'https://example.com/image.webp' },
      } as any)
    ).resolves.toBeNull();
    expect(docxDocument.createMediaFile).not.toHaveBeenCalled();
  });

  it('does not fetch remote images by default', async () => {
    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(async () => {
      throw new Error('unexpected fetch');
    });
    const docxDocument = {
      allowRemoteImages: false,
      createMediaFile: mock(),
    } as any;

    await expect(
      buildImage(docxDocument, {
        properties: { src: 'https://example.com/image.png' },
      } as any)
    ).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(docxDocument.createMediaFile).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('imports loose text nodes as paragraphs', async () => {
    const blob = await htmlToDocxBlob('loose text<p>para</p>');
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain('loose text');
  });
});
