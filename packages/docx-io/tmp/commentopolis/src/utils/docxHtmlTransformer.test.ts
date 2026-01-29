import { describe, it, expect } from 'vitest';
import { transformDocumentToHtml, twipsToPixels } from './docxHtmlTransformer';

// Helper function to create XML DOM from string
function createXmlDocument(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

describe('docxHtmlTransformer', () => {
  describe('transformDocumentToHtml', () => {
    it('should handle empty document', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>No document content found.</p>');
      expect(result.plainText).toBe('No document content found.');
    });

    it('should handle document with no content', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>No content found in document.</p>');
      expect(result.plainText).toBe('No content found in document.');
    });

    it('should transform simple paragraph with plain text', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Hello, World!</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>Hello, World!</p>');
      expect(result.plainText).toBe('Hello, World!');
    });

    it('should transform paragraph with multiple runs', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Hello, </w:t>
              </w:r>
              <w:r>
                <w:t>World!</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>Hello, World!</p>');
      expect(result.plainText).toBe('Hello, World!');
    });

    it('should transform multiple paragraphs', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>First paragraph.</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:r>
                <w:t>Second paragraph.</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>First paragraph.</p>\n<p>Second paragraph.</p>');
      expect(result.plainText).toBe('First paragraph.\nSecond paragraph.');
    });

    it('should transform run with bold formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b />
                </w:rPr>
                <w:t>Bold text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-weight: bold">Bold text</span></p>');
      expect(result.plainText).toBe('Bold text');
    });

    it('should transform run with italic formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:i />
                </w:rPr>
                <w:t>Italic text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-style: italic">Italic text</span></p>');
      expect(result.plainText).toBe('Italic text');
    });

    it('should transform run with underline formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:u w:val="single" />
                </w:rPr>
                <w:t>Underlined text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="text-decoration: underline">Underlined text</span></p>');
      expect(result.plainText).toBe('Underlined text');
    });

    it('should transform run with multiple formatting properties', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b />
                  <w:i />
                  <w:u w:val="single" />
                  <w:sz w:val="24" />
                  <w:color w:val="FF0000" />
                </w:rPr>
                <w:t>Formatted text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      const expectedStyle = 'font-weight: bold; font-style: italic; text-decoration: underline; font-size: 12pt; color: #FF0000';
      expect(result.html).toBe(`<p><span style="${expectedStyle}">Formatted text</span></p>`);
      expect(result.plainText).toBe('Formatted text');
    });

    it('should transform run with font family', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Arial" />
                </w:rPr>
                <w:t>Arial text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-family: "Arial"">Arial text</span></p>');
      expect(result.plainText).toBe('Arial text');
    });

    it('should transform paragraph with center alignment', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="center" />
              </w:pPr>
              <w:r>
                <w:t>Centered text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="text-align: center">Centered text</p>');
      expect(result.plainText).toBe('Centered text');
    });

    it('should transform paragraph with right alignment', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="right" />
              </w:pPr>
              <w:r>
                <w:t>Right-aligned text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="text-align: right">Right-aligned text</p>');
      expect(result.plainText).toBe('Right-aligned text');
    });

    it('should transform paragraph with justify alignment', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="both" />
              </w:pPr>
              <w:r>
                <w:t>Justified text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="text-align: justify">Justified text</p>');
      expect(result.plainText).toBe('Justified text');
    });

    it('should transform paragraph with left indentation', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:ind w:left="720" />
              </w:pPr>
              <w:r>
                <w:t>Indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="margin-left: 48px">Indented text</p>');
      expect(result.plainText).toBe('Indented text');
    });

    it('should transform paragraph with right indentation', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:ind w:right="360" />
              </w:pPr>
              <w:r>
                <w:t>Right indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="margin-right: 24px">Right indented text</p>');
      expect(result.plainText).toBe('Right indented text');
    });

    it('should transform paragraph with first line indentation', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:ind w:firstLine="1440" />
              </w:pPr>
              <w:r>
                <w:t>First line indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="text-indent: 96px">First line indented text</p>');
      expect(result.plainText).toBe('First line indented text');
    });

    it('should transform paragraph with multiple indentation properties', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="center" />
                <w:ind w:left="720" w:right="360" w:firstLine="1440" />
              </w:pPr>
              <w:r>
                <w:t>Complex indented text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p style="text-align: center; margin-left: 48px; margin-right: 24px; text-indent: 96px">Complex indented text</p>');
      expect(result.plainText).toBe('Complex indented text');
    });

    it('should handle empty runs and paragraphs', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t></w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:r>
                <w:t>Non-empty paragraph</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p></p>\n<p>Non-empty paragraph</p>');
      expect(result.plainText).toBe('Non-empty paragraph');
    });

    it('should escape HTML special characters', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>&lt;script&gt;alert('test')&lt;/script&gt;</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>&lt;script&gt;alert(\'test\')&lt;/script&gt;</p>');
      expect(result.plainText).toBe('<script>alert(\'test\')</script>');
    });

    it('should work with namespaced and non-namespaced elements', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <document>
          <body>
            <p>
              <r>
                <rPr>
                  <b />
                </rPr>
                <t>Bold text without namespace</t>
              </r>
            </p>
          </body>
        </document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-weight: bold">Bold text without namespace</span></p>');
      expect(result.plainText).toBe('Bold text without namespace');
    });

    it('should transform run with highlight formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:highlight w:val="yellow" />
                </w:rPr>
                <w:t>Highlighted text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="background-color: #ffff00">Highlighted text</span></p>');
      expect(result.plainText).toBe('Highlighted text');
    });

    it('should transform run with custom highlight color', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:highlight w:val="#ff5733" />
                </w:rPr>
                <w:t>Custom highlighted text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="background-color: #ff5733">Custom highlighted text</span></p>');
      expect(result.plainText).toBe('Custom highlighted text');
    });

    it('should transform run with strikethrough formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:strike />
                </w:rPr>
                <w:t>Strikethrough text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="text-decoration: line-through">Strikethrough text</span></p>');
      expect(result.plainText).toBe('Strikethrough text');
    });

    it('should transform run with double strikethrough formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:dstrike />
                </w:rPr>
                <w:t>Double strikethrough text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="text-decoration: line-through">Double strikethrough text</span></p>');
      expect(result.plainText).toBe('Double strikethrough text');
    });

    it('should transform run with single underline formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:u w:val="single" />
                </w:rPr>
                <w:t>Single underlined text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="text-decoration: underline">Single underlined text</span></p>');
      expect(result.plainText).toBe('Single underlined text');
    });

    it('should transform run with double underline formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:u w:val="double" />
                </w:rPr>
                <w:t>Double underlined text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="text-decoration: underline; text-decoration-style: double">Double underlined text</span></p>');
      expect(result.plainText).toBe('Double underlined text');
    });

    it('should transform run with no underline formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:u w:val="none" />
                </w:rPr>
                <w:t>No underline text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="text-decoration: none">No underline text</span></p>');
      expect(result.plainText).toBe('No underline text');
    });

    it('should transform run with all capitals formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:caps />
                </w:rPr>
                <w:t>all capitals text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="text-transform: uppercase">all capitals text</span></p>');
      expect(result.plainText).toBe('all capitals text');
    });

    it('should transform run with small capitals formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:smallCaps />
                </w:rPr>
                <w:t>Small Capitals Text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-variant: small-caps">Small Capitals Text</span></p>');
      expect(result.plainText).toBe('Small Capitals Text');
    });

    it('should transform run with superscript formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:vertAlign w:val="superscript" />
                </w:rPr>
                <w:t>superscript</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="vertical-align: super; font-size: smaller">superscript</span></p>');
      expect(result.plainText).toBe('superscript');
    });

    it('should transform run with subscript formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:vertAlign w:val="subscript" />
                </w:rPr>
                <w:t>subscript</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="vertical-align: sub; font-size: smaller">subscript</span></p>');
      expect(result.plainText).toBe('subscript');
    });

    it('should transform run with multiple new formatting properties', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b />
                  <w:strike />
                  <w:highlight w:val="yellow" />
                  <w:caps />
                  <w:u w:val="double" />
                </w:rPr>
                <w:t>complex formatting</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      const expectedStyle = 'font-weight: bold; text-decoration: underline line-through; text-decoration-style: double; background-color: #ffff00; text-transform: uppercase';
      expect(result.html).toBe(`<p><span style="${expectedStyle}">complex formatting</span></p>`);
      expect(result.plainText).toBe('complex formatting');
    });
  });

  describe('twipsToPixels', () => {
    it('should convert twips to pixels using the correct formula', () => {
      // Test known conversion values
      expect(twipsToPixels(1440)).toBe(96); // 1440 twips = 1 inch at 96 DPI
      expect(twipsToPixels(720)).toBe(48);  // 720 twips = 0.5 inch at 96 DPI
      expect(twipsToPixels(360)).toBe(24);  // 360 twips = 0.25 inch at 96 DPI
    });

    it('should handle zero input', () => {
      expect(twipsToPixels(0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(twipsToPixels(-1440)).toBe(-96);
    });

    it('should round to nearest pixel', () => {
      // Test rounding behavior
      expect(twipsToPixels(360)).toBe(24); // Should round down
      expect(twipsToPixels(380)).toBe(25); // Should round up
    });

    it('should maintain consistent conversion with original formula', () => {
      // Test that the extracted function produces the same results as the original formula
      const testValues = [100, 500, 1000, 1440, 2000];
      
      testValues.forEach(twips => {
        const expected = Math.round(twips / 20 * 96 / 72);
        expect(twipsToPixels(twips)).toBe(expected);
      });
    });
  });

  describe('tracked changes (revisions)', () => {
    it('should transform run with insertion tracking', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:ins w:id="1" w:author="John Doe" w:date="2023-12-01T10:00:00Z">
                <w:r>
                  <w:t>Inserted text</w:t>
                </w:r>
              </w:ins>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="color: #008000; text-decoration: underline">Inserted text</span></p>');
      expect(result.plainText).toBe('Inserted text');
    });

    it('should transform run with deletion tracking', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:del w:id="2" w:author="Jane Smith" w:date="2023-12-01T11:00:00Z">
                <w:r>
                  <w:t>Deleted text</w:t>
                </w:r>
              </w:del>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="color: #ff0000; text-decoration: line-through">Deleted text</span></p>');
      expect(result.plainText).toBe('Deleted text');
    });

    it('should transform run with moveFrom tracking', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:moveFrom w:id="3" w:author="Bob Wilson" w:date="2023-12-01T12:00:00Z">
                <w:r>
                  <w:t>Moved from here</w:t>
                </w:r>
              </w:moveFrom>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="color: #0000ff; text-decoration: line-through">Moved from here</span></p>');
      expect(result.plainText).toBe('Moved from here');
    });

    it('should transform run with moveTo tracking', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:moveTo w:id="4" w:author="Alice Brown" w:date="2023-12-01T13:00:00Z">
                <w:r>
                  <w:t>Moved to here</w:t>
                </w:r>
              </w:moveTo>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="color: #0000ff; text-decoration: underline">Moved to here</span></p>');
      expect(result.plainText).toBe('Moved to here');
    });

    it('should handle tracked changes without namespace prefix', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <document>
          <body>
            <p>
              <ins id="1" author="Test User" date="2023-12-01T10:00:00Z">
                <r>
                  <t>Inserted without namespace</t>
                </r>
              </ins>
            </p>
          </body>
        </document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="color: #008000; text-decoration: underline">Inserted without namespace</span></p>');
      expect(result.plainText).toBe('Inserted without namespace');
    });

    it('should handle mixed tracked changes with regular text', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Regular text </w:t>
              </w:r>
              <w:ins w:id="1" w:author="Editor">
                <w:r>
                  <w:t>inserted text </w:t>
                </w:r>
              </w:ins>
              <w:del w:id="2" w:author="Editor">
                <w:r>
                  <w:t>deleted text </w:t>
                </w:r>
              </w:del>
              <w:r>
                <w:t>more regular text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p>Regular text <span style="color: #008000; text-decoration: underline">inserted text </span><span style="color: #ff0000; text-decoration: line-through">deleted text </span>more regular text</p>');
      expect(result.plainText).toBe('Regular text inserted text deleted text more regular text');
    });

    it('should handle tracked changes with existing formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:ins w:id="1" w:author="Editor">
                <w:r>
                  <w:rPr>
                    <w:b />
                    <w:i />
                  </w:rPr>
                  <w:t>Bold italic inserted text</w:t>
                </w:r>
              </w:ins>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-weight: bold; font-style: italic; color: #008000; text-decoration: underline">Bold italic inserted text</span></p>');
      expect(result.plainText).toBe('Bold italic inserted text');
    });
  });

  describe('Footnotes and Endnotes', () => {
    it('should transform footnote references to superscript links', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>This is text with a footnote</w:t>
              </w:r>
              <w:r>
                <w:footnoteReference w:id="1" />
              </w:r>
              <w:r>
                <w:t> and more text.</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const footnotes = [{
        id: 'doc-1-footnote-1',
        type: 'footnote' as const,
        content: '<p>This is a footnote</p>',
        plainText: 'This is a footnote',
        documentId: 'doc-1',
        noteType: 'normal' as const
      }];
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc, footnotes, []);
      
      expect(result.html).toContain('<sup><a href="#footnote-1" id="footnote-ref-1" class="footnote-link">1</a></sup>');
      expect(result.html).toContain('<div class="footnotes">');
      expect(result.html).toContain('<div class="footnote" id="footnote-1">');
      expect(result.html).toContain('<a href="#footnote-ref-1" class="footnote-backlink">1.</a> <p>This is a footnote</p>');
    });

    it('should transform endnote references to superscript links', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>This is text with an endnote</w:t>
              </w:r>
              <w:r>
                <w:endnoteReference w:id="1" />
              </w:r>
              <w:r>
                <w:t> and more text.</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const endnotes = [{
        id: 'doc-1-endnote-1',
        type: 'endnote' as const,
        content: '<p>This is an endnote</p>',
        plainText: 'This is an endnote',
        documentId: 'doc-1',
        noteType: 'normal' as const
      }];
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc, [], endnotes);
      
      expect(result.html).toContain('<sup><a href="#endnote-1" id="endnote-ref-1" class="endnote-link">1</a></sup>');
      expect(result.html).toContain('<div class="endnotes">');
      expect(result.html).toContain('<div class="endnote" id="endnote-1">');
      expect(result.html).toContain('<a href="#endnote-ref-1" class="endnote-backlink">1.</a> <p>This is an endnote</p>');
    });

    it('should handle documents with both footnotes and endnotes', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Text with footnote</w:t>
              </w:r>
              <w:r>
                <w:footnoteReference w:id="1" />
              </w:r>
              <w:r>
                <w:t> and endnote</w:t>
              </w:r>
              <w:r>
                <w:endnoteReference w:id="1" />
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const footnotes = [{
        id: 'doc-1-footnote-1',
        type: 'footnote' as const,
        content: '<p>Footnote content</p>',
        plainText: 'Footnote content',
        documentId: 'doc-1',
        noteType: 'normal' as const
      }];
      
      const endnotes = [{
        id: 'doc-1-endnote-1',
        type: 'endnote' as const,
        content: '<p>Endnote content</p>',
        plainText: 'Endnote content',
        documentId: 'doc-1',
        noteType: 'normal' as const
      }];
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc, footnotes, endnotes);
      
      expect(result.html).toContain('<sup><a href="#footnote-1" id="footnote-ref-1" class="footnote-link">1</a></sup>');
      expect(result.html).toContain('<sup><a href="#endnote-1" id="endnote-ref-1" class="endnote-link">1</a></sup>');
      expect(result.html).toContain('<div class="footnotes">');
      expect(result.html).toContain('<div class="endnotes">');
      expect(result.plainText).toContain('Footnote content');
      expect(result.plainText).toContain('Endnote content');
    });

    it('should handle footnote references without corresponding footnote definitions', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Text with missing footnote</w:t>
              </w:r>
              <w:r>
                <w:footnoteReference w:id="999" />
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc, [], []);
      
      expect(result.html).toContain('Text with missing footnote');
      expect(result.html).not.toContain('footnote-link');
      expect(result.html).not.toContain('<div class="footnotes">');
    });

    it('should skip separator footnotes in output', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Simple text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const footnotes = [
        {
          id: 'doc-1-footnote--1',
          type: 'footnote' as const,
          content: '<p>Separator</p>',
          plainText: 'Separator',
          documentId: 'doc-1',
          noteType: 'separator' as const
        },
        {
          id: 'doc-1-footnote-1',
          type: 'footnote' as const,
          content: '<p>Normal footnote</p>',
          plainText: 'Normal footnote',
          documentId: 'doc-1',
          noteType: 'normal' as const
        }
      ];
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc, footnotes, []);
      
      expect(result.html).toContain('<div class="footnotes">');
      expect(result.html).toContain('Normal footnote');
      expect(result.html).not.toContain('Separator');
    });
  });

  describe('Table transformation', () => {
    it('should transform simple table with one cell', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:tbl>
              <w:tr>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Cell content</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
            </w:tbl>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('<table style="border-collapse: collapse; width: 100%">');
      expect(result.html).toContain('<td style="border: 1px solid #ddd; padding: 8px">');
      expect(result.html).toContain('<p>Cell content</p>');
      expect(result.html).toContain('</td>');
      expect(result.html).toContain('</table>');
      expect(result.plainText).toBe('Cell content');
    });

    it('should transform table with multiple rows and cells', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:tbl>
              <w:tr>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Header 1</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Header 2</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
              <w:tr>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Data 1</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Data 2</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
            </w:tbl>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('<table style="border-collapse: collapse; width: 100%">');
      expect(result.html).toContain('<p>Header 1</p>');
      expect(result.html).toContain('<p>Header 2</p>');
      expect(result.html).toContain('<p>Data 1</p>');
      expect(result.html).toContain('<p>Data 2</p>');
      expect(result.plainText).toContain('Header 1');
      expect(result.plainText).toContain('Data 2');
    });

    it('should transform table with cell properties', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:tbl>
              <w:tr>
                <w:tc>
                  <w:tcPr>
                    <w:tcW w:w="2000" w:type="dxa" />
                    <w:vAlign w:val="center" />
                    <w:shd w:fill="FFFF00" />
                  </w:tcPr>
                  <w:p>
                    <w:r>
                      <w:t>Styled cell</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
            </w:tbl>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('width: 133px');
      expect(result.html).toContain('vertical-align: middle');
      expect(result.html).toContain('background-color: #FFFF00');
      expect(result.html).toContain('<p>Styled cell</p>');
    });

    it('should transform table with table properties', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:tbl>
              <w:tblPr>
                <w:jc w:val="center" />
                <w:tblW w:w="4000" w:type="pct" />
              </w:tblPr>
              <w:tr>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Centered table</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
            </w:tbl>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('margin-left: auto');
      expect(result.html).toContain('margin-right: auto');
      expect(result.html).toContain('width: 80%');
      expect(result.html).toContain('<p>Centered table</p>');
    });

    it('should transform table mixed with paragraphs', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Before table</w:t>
              </w:r>
            </w:p>
            <w:tbl>
              <w:tr>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Table data</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
            </w:tbl>
            <w:p>
              <w:r>
                <w:t>After table</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('<p>Before table</p>');
      expect(result.html).toContain('<table style="border-collapse: collapse; width: 100%">');
      expect(result.html).toContain('<p>Table data</p>');
      expect(result.html).toContain('<p>After table</p>');
      expect(result.plainText).toContain('Before table');
      expect(result.plainText).toContain('Table data');
      expect(result.plainText).toContain('After table');
    });

    it('should handle empty table cells', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:tbl>
              <w:tr>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t></w:t>
                    </w:r>
                  </w:p>
                </w:tc>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:t>Non-empty</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
            </w:tbl>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('<table');
      expect(result.html).toContain('<p></p>');
      expect(result.html).toContain('<p>Non-empty</p>');
    });

    it('should handle table cells with formatted text', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:tbl>
              <w:tr>
                <w:tc>
                  <w:p>
                    <w:r>
                      <w:rPr>
                        <w:b />
                      </w:rPr>
                      <w:t>Bold in table</w:t>
                    </w:r>
                  </w:p>
                </w:tc>
              </w:tr>
            </w:tbl>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('<span style="font-weight: bold">Bold in table</span>');
      expect(result.plainText).toBe('Bold in table');
    });

    it('should work with namespaced and non-namespaced table elements', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <document>
          <body>
            <tbl>
              <tr>
                <tc>
                  <p>
                    <r>
                      <t>No namespace table</t>
                    </r>
                  </p>
                </tc>
              </tr>
            </tbl>
          </body>
        </document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('<table style="border-collapse: collapse; width: 100%">');
      expect(result.html).toContain('<p>No namespace table</p>');
      expect(result.plainText).toBe('No namespace table');
    });

    it('should handle paragraph numbering with numPr elements', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:ilvl w:val="0"/>
                  <w:numId w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r>
                <w:t>First numbered item</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:ilvl w:val="0"/>
                  <w:numId w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r>
                <w:t>Second numbered item</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:ilvl w:val="1"/>
                  <w:numId w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r>
                <w:t>Nested item</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:ilvl w:val="0"/>
                  <w:numId w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r>
                <w:t>Third numbered item</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('<span class="numbering-text">1. </span>First numbered item');
      expect(result.html).toContain('<span class="numbering-text">2. </span>Second numbered item');
      expect(result.html).toContain('<span class="numbering-text">1. </span>Nested item');
      expect(result.html).toContain('<span class="numbering-text">3. </span>Third numbered item');
      expect(result.plainText).toContain('First numbered item');
      expect(result.plainText).toContain('Second numbered item');
      expect(result.plainText).toContain('Nested item');
      expect(result.plainText).toContain('Third numbered item');
    });

    it('should handle multiple numbering lists with different numId values', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:ilvl w:val="0"/>
                  <w:numId w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r>
                <w:t>List 1 - Item 1</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:ilvl w:val="0"/>
                  <w:numId w:val="2"/>
                </w:numPr>
              </w:pPr>
              <w:r>
                <w:t>List 2 - Item 1</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:ilvl w:val="0"/>
                  <w:numId w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r>
                <w:t>List 1 - Item 2</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toContain('<span class="numbering-text">1. </span>List 1 - Item 1');
      expect(result.html).toContain('<span class="numbering-text">1. </span>List 2 - Item 1');
      expect(result.html).toContain('<span class="numbering-text">2. </span>List 1 - Item 2');
    });
  });

  describe('Line breaks in runs', () => {
    it('should transform run with single line break', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>First line</w:t>
                <w:br/>
                <w:t>Second line</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span>First line<br>Second line</span></p>');
      expect(result.plainText).toBe('First line\nSecond line');
    });

    it('should transform run with multiple line breaks', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Line 1</w:t>
                <w:br/>
                <w:t>Line 2</w:t>
                <w:br/>
                <w:t>Line 3</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span>Line 1<br>Line 2<br>Line 3</span></p>');
      expect(result.plainText).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should transform run with line break and formatting', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:b/>
                </w:rPr>
                <w:t>Bold line 1</w:t>
                <w:br/>
                <w:t>Bold line 2</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span style="font-weight: bold">Bold line 1<br>Bold line 2</span></p>');
      expect(result.plainText).toBe('Bold line 1\nBold line 2');
    });

    it('should handle line break without namespace prefix', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>First</w:t>
                <br/>
                <w:t>Second</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span>First<br>Second</span></p>');
      expect(result.plainText).toBe('First\nSecond');
    });

    it('should handle consecutive line breaks', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Text</w:t>
                <w:br/>
                <w:br/>
                <w:t>After double break</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span>Text<br><br>After double break</span></p>');
      expect(result.plainText).toBe('Text\n\nAfter double break');
    });

    it('should handle line break at the beginning', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:br/>
                <w:t>Text after break</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span><br>Text after break</span></p>');
      expect(result.plainText).toBe('\nText after break');
    });

    it('should handle line break at the end', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>Text before break</w:t>
                <w:br/>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      expect(result.html).toBe('<p><span>Text before break<br></span></p>');
      expect(result.plainText).toBe('Text before break\n');
    });

    it('should preserve leading whitespace when xml:space is preserve', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:xml="http://www.w3.org/XML/1998/namespace">
          <w:body>
            <w:p>
              <w:r>
                <w:t xml:space="preserve">  Leading spaces</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      // Leading spaces should be converted to &nbsp; for proper rendering
      expect(result.html).toBe('<p><span>&nbsp;&nbsp;Leading spaces</span></p>');
      expect(result.plainText).toBe('  Leading spaces');
    });

    it('should preserve trailing whitespace when xml:space is preserve', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:xml="http://www.w3.org/XML/1998/namespace">
          <w:body>
            <w:p>
              <w:r>
                <w:t xml:space="preserve">Trailing spaces  </w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      // Trailing spaces should be converted to &nbsp; for proper rendering
      expect(result.html).toBe('<p><span>Trailing spaces&nbsp;&nbsp;</span></p>');
      expect(result.plainText).toBe('Trailing spaces  ');
    });

    it('should preserve both leading and trailing whitespace when xml:space is preserve', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:xml="http://www.w3.org/XML/1998/namespace">
          <w:body>
            <w:p>
              <w:r>
                <w:t xml:space="preserve">  Both sides  </w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      // Both leading and trailing spaces should be converted to &nbsp; for proper rendering
      expect(result.html).toBe('<p><span>&nbsp;&nbsp;Both sides&nbsp;&nbsp;</span></p>');
      expect(result.plainText).toBe('  Both sides  ');
    });

    it('should not convert whitespace to nbsp when xml:space is not preserve', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:t>  Should be trimmed  </w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      // Without xml:space="preserve", spaces are left as-is (browser will handle trimming)
      expect(result.html).toBe('<p><span>  Should be trimmed  </span></p>');
      expect(result.plainText).toBe('  Should be trimmed  ');
    });

    it('should handle xml:space preserve with HTML special characters', () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:xml="http://www.w3.org/XML/1998/namespace">
          <w:body>
            <w:p>
              <w:r>
                <w:t xml:space="preserve">  &lt;tag&gt; &amp; "quotes"  </w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`;
      
      const xmlDoc = createXmlDocument(xmlString);
      const result = transformDocumentToHtml(xmlDoc);
      
      // HTML entities should be escaped and leading/trailing spaces converted to &nbsp;
      expect(result.html).toBe('<p><span>&nbsp;&nbsp;&lt;tag&gt; &amp; "quotes"&nbsp;&nbsp;</span></p>');
      expect(result.plainText).toBe('  <tag> & "quotes"  ');
    });
  });
});