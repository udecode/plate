// @ts-expect-error - no types available
import VText from 'virtual-dom/vnode/vtext.js';
import { fragment } from 'xmlbuilder2';

import { convertVTreeToXML } from './render-document-file';
import * as xmlBuilder from './xml-builder';
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

  it('returns an empty string for null trees and imports paragraphs for text nodes', async () => {
    const docxDocument = {} as any;
    const nullFragment = fragment({ namespaceAlias: { w: 'urn:test' } });
    const xmlFragment = fragment({ namespaceAlias: { w: 'urn:test' } });
    const buildParagraphSpy = spyOn(
      xmlBuilder,
      'buildParagraph'
    ).mockImplementation(async () =>
      fragment({ namespaceAlias: { w: 'urn:test' } })
        .ele('@w', 'p')
        .up()
    );

    await expect(
      convertVTreeToXML(docxDocument, null, nullFragment)
    ).resolves.toBe('');

    const result = await convertVTreeToXML(
      docxDocument,
      new VText('hello') as any,
      xmlFragment
    );

    expect(buildParagraphSpy).toHaveBeenCalledWith(
      expect.any(VText),
      {},
      docxDocument
    );
    expect((result as any).end({ prettyPrint: false })).toContain('<p');
  });
});
