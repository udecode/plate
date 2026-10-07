import JSZip from 'jszip';

import { htmlToDocxBlob } from '../../html-to-docx';
import { fixupLineHeight } from './xml-builder';

describe('fixupLineHeight', () => {
  it.each([
    ['24px', { line: 360, lineRule: 'atLeast' }],
    ['18pt', { line: 360, lineRule: 'atLeast' }],
    ['1cm', { line: 560, lineRule: 'atLeast' }],
    ['1.5', { line: 360, lineRule: 'auto' }],
    ['1.5em', { line: 360, lineRule: 'auto' }],
    ['150%', { line: 360, lineRule: 'auto' }],
    ['115%', { line: 276, lineRule: 'auto' }],
  ] as const)('converts %s to its w:spacing line and rule', (lineHeight, expected) => {
    expect(fixupLineHeight(lineHeight)).toEqual(expected);
  });

  it.each([
    'normal',
    'calc(1em + 4px)',
    '0',
  ])('keeps the document default line spacing for %s', (lineHeight) => {
    expect(fixupLineHeight(lineHeight)).toBeUndefined();
  });
});

describe('buildParagraph line spacing', () => {
  it('writes an absolute line height in twips with the atLeast rule', async () => {
    const documentXml = await exportDocumentXml(
      '<h1 style="font-size: 18px; line-height: 24px">Heading</h1>'
    );

    expect(documentXml).toContain(
      '<w:spacing w:line="360" w:lineRule="atLeast"/>'
    );
  });

  it('writes a unitless line height as a line multiplier whatever the font size', async () => {
    const documentXml = await exportDocumentXml(
      '<p style="font-size: 11pt; line-height: 1.5">text</p>'
    );

    expect(documentXml).toContain(
      '<w:spacing w:line="360" w:lineRule="auto"/>'
    );
  });
});

const exportDocumentXml = async (html: string): Promise<string> => {
  const blob = await htmlToDocxBlob(
    `<html><head></head><body>${html}</body></html>`
  );
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());

  return zip.file('word/document.xml')!.async('string');
};
