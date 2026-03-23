import JSZip from 'jszip';

import {
  documentFileName,
  headerType,
  hyperlinkType,
  imageType,
} from './constants';
import DocxDocument from './docx-document';
import namespaces from './namespaces';

const createDocxDocument = (overrides = {}) =>
  new DocxDocument({
    htmlString: '<p>Test</p>',
    zip: new JSZip(),
    ...overrides,
  });

describe('DocxDocument', () => {
  it('creates relationships with the correct OOXML namespace and next id', () => {
    const document = createDocxDocument();

    expect(
      document.createDocumentRelationships(
        documentFileName,
        hyperlinkType,
        'https://platejs.org'
      )
    ).toBe(6);
    expect(
      document.createDocumentRelationships(
        documentFileName,
        imageType,
        'media/image-1.png',
        'Internal'
      )
    ).toBe(7);
    expect(
      document.createDocumentRelationships(
        documentFileName,
        headerType,
        'header1.xml',
        'Internal'
      )
    ).toBe(8);

    const relationshipsXml = document
      .generateRelsXML()
      .find(({ fileName }) => fileName === documentFileName)!.xmlString;

    expect(relationshipsXml).toContain(`Id="rId6"`);
    expect(relationshipsXml).toContain(`Type="${namespaces.hyperlinks}"`);
    expect(relationshipsXml).toContain('Target="https://platejs.org"');
    expect(relationshipsXml).toContain(`Id="rId7"`);
    expect(relationshipsXml).toContain(`Type="${namespaces.images}"`);
    expect(relationshipsXml).toContain('Target="media/image-1.png"');
    expect(relationshipsXml).toContain(`Id="rId8"`);
    expect(relationshipsXml).toContain(`Type="${namespaces.headers}"`);
    expect(relationshipsXml).toContain('Target="header1.xml"');
  });

  it('normalizes octet-stream media to png and rejects invalid base64 payloads', () => {
    const document = createDocxDocument();

    expect(
      document.createMediaFile('data:application/octet-stream;base64,QUJDRA==')
    ).toEqual({
      fileContent: 'QUJDRA==',
      fileNameWithExtension: expect.stringMatching(/^image-.+\.png$/),
      id: 1,
    });

    expect(() => document.createMediaFile('not-base64')).toThrow(
      'Invalid base64 string'
    );
  });

  it('adds custom fonts once with generic family metadata', () => {
    const document = createDocxDocument({ font: 'Arial' });

    expect(document.createFont('"IBM Plex Serif", serif')).toBe(
      'IBM Plex Serif'
    );
    document.createFont('"IBM Plex Serif", serif');
    document.createFont('"Fira Code", monospace');

    const fontTableXml = document.generateFontTableXML();

    expect(fontTableXml.match(/w:name="IBM Plex Serif"/g)).toHaveLength(1);
    expect(fontTableXml).toMatch(
      /<w:font w:name="IBM Plex Serif">[\s\S]*?<w:altName w:val="Times New Roman"\/>[\s\S]*?<w:family w:val="roman"\/>[\s\S]*?<w:pitch w:val="variable"\/>/
    );
    expect(fontTableXml).toMatch(
      /<w:font w:name="Fira Code">[\s\S]*?<w:altName w:val="Courier New"\/>[\s\S]*?<w:family w:val="modern"\/>[\s\S]*?<w:pitch w:val="fixed"\/>/
    );
  });
});
