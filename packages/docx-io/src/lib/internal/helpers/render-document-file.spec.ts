// @ts-expect-error - no types available
import VText from 'virtual-dom/vnode/vtext';
import { fragment } from 'xmlbuilder2';

import * as xmlBuilder from './xml-builder';
import {
  buildImage,
  convertVTreeToXML,
  getListTracking,
  resetListTracking,
  setListTracking,
} from './render-document-file';

describe('render-document-file helpers', () => {
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

  it('tracks numbering ids by list type and indent level and resets them', () => {
    resetListTracking();
    setListTracking('ul', 3, 0);
    setListTracking('ul', 7, 1);
    setListTracking('ol', 9, 0);

    expect(getListTracking('ul', 0)).toEqual({ lastListNumberingId: 3 });
    expect(getListTracking('ul', 1)).toEqual({ lastListNumberingId: 7 });
    expect(getListTracking('ol', 0)).toEqual({ lastListNumberingId: 9 });

    resetListTracking();

    expect(getListTracking('ul', 0)).toEqual({ lastListNumberingId: null });
    expect(getListTracking('ol', 0)).toEqual({ lastListNumberingId: null });
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
