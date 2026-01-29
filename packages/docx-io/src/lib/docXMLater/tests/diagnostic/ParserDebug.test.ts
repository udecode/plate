import { describe, it, expect } from '@jest/globals';
import { XMLParser } from '../../src/xml/XMLParser';
import { XMLBuilder } from '../../src/xml/XMLBuilder';

describe('Parser Debug - Working.docx', () => {
  it('should extract text from Working.docx run format', () => {
    // Actual run from Working.docx
    const runXml = `<w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr><w:t xml:space="preserve">Aetna - Specialty M</w:t></w:r>`;

    const text = XMLParser.extractText(runXml);
    console.log(`Extracted text: "${text}"`);
    console.log(`Extracted length: ${text.length}`);

    const unescaped = XMLBuilder.unescapeXml(text);
    console.log(`After unescape: "${unescaped}"`);

    expect(text).toBe('Aetna - Specialty M');
  });

  it('should handle run with no text tag', () => {
    const emptyRunXml = `<w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r>`;

    const text = XMLParser.extractText(emptyRunXml);
    console.log(`Empty run extracted: "${text}"`);
    console.log(`Empty run length: ${text.length}`);

    expect(text).toBe('');
  });
});
