import { describe, it, expect } from 'vitest';
import { transformDocumentToHtml } from './docxHtmlTransformer';

// Helper function to create XML DOM from string
function createXmlDocument(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

describe('Style-based numbering', () => {
  describe('Direct numbering (existing functionality)', () => {
    it('should apply direct numbering with decimal format', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First item</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Second item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`);

      const result = transformDocumentToHtml(documentXml, [], [], numberingXml);
      
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
      expect(result.html).toContain('<span class="numbering-text">2. </span>');
      expect(result.html).toContain('First item');
      expect(result.html).toContain('Second item');
    });

    it('should apply direct numbering with Roman numerals', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First item</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Second item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="upperRoman"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`);

      const result = transformDocumentToHtml(documentXml, [], [], numberingXml);
      
      expect(result.html).toContain('<span class="numbering-text">I. </span>');
      expect(result.html).toContain('<span class="numbering-text">II. </span>');
    });

    it('should apply multi-level numbering with template', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Level 1</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Level 2</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Level 2 again</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
            <w:lvl w:ilvl="1">
              <w:numFmt w:val="lowerLetter"/>
              <w:lvlText w:val="%1.%2)"/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`);

      const result = transformDocumentToHtml(documentXml, [], [], numberingXml);
      
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
      expect(result.html).toContain('<span class="numbering-text">1.a) </span>');
      expect(result.html).toContain('<span class="numbering-text">1.b) </span>');
    });
  });

  describe('Style-based numbering', () => {
    it('should apply numbering from paragraph style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="ListParagraph"/>
              </w:pPr>
              <w:r><w:t>First item</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="ListParagraph"/>
              </w:pPr>
              <w:r><w:t>Second item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="ListParagraph">
            <w:pPr>
              <w:numPr>
                <w:numId w:val="1"/>
                <w:ilvl w:val="0"/>
              </w:numPr>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`);

      const result = transformDocumentToHtml(documentXml, [], [], numberingXml, stylesXml);
      
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
      expect(result.html).toContain('<span class="numbering-text">2. </span>');
      expect(result.html).toContain('First item');
      expect(result.html).toContain('Second item');
    });

    it('should walk up basedOn hierarchy to find numbering', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="CustomList"/>
              </w:pPr>
              <w:r><w:t>First item</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="CustomList"/>
              </w:pPr>
              <w:r><w:t>Second item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="ListParagraph">
            <w:pPr>
              <w:numPr>
                <w:numId w:val="1"/>
                <w:ilvl w:val="0"/>
              </w:numPr>
            </w:pPr>
          </w:style>
          <w:style w:styleId="CustomList">
            <w:basedOn w:val="ListParagraph"/>
          </w:style>
        </w:styles>`);

      const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="upperLetter"/>
              <w:lvlText w:val="%1)"/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`);

      const result = transformDocumentToHtml(documentXml, [], [], numberingXml, stylesXml);
      
      expect(result.html).toContain('<span class="numbering-text">A) </span>');
      expect(result.html).toContain('<span class="numbering-text">B) </span>');
    });

    it('should prioritize direct numbering over style-based numbering', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="ListParagraph"/>
                <w:numPr>
                  <w:numId w:val="2"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First item</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="ListParagraph"/>
                <w:numPr>
                  <w:numId w:val="2"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Second item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="ListParagraph">
            <w:pPr>
              <w:numPr>
                <w:numId w:val="1"/>
                <w:ilvl w:val="0"/>
              </w:numPr>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
          </w:abstractNum>
          <w:abstractNum w:abstractNumId="1">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="lowerRoman"/>
              <w:lvlText w:val="%1)"/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
          <w:num w:numId="2">
            <w:abstractNumId w:val="1"/>
          </w:num>
        </w:numbering>`);

      const result = transformDocumentToHtml(documentXml, [], [], numberingXml, stylesXml);
      
      // Should use numId="2" (Roman) from direct numbering, not numId="1" (decimal) from style
      expect(result.html).toContain('<span class="numbering-text">i) </span>');
      expect(result.html).toContain('<span class="numbering-text">ii) </span>');
      expect(result.html).not.toContain('1.');
    });

    it('should handle circular basedOn references gracefully', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="StyleA"/>
              </w:pPr>
              <w:r><w:t>Test item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="StyleA">
            <w:basedOn w:val="StyleB"/>
          </w:style>
          <w:style w:styleId="StyleB">
            <w:basedOn w:val="StyleA"/>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      // Should not crash and should produce output without numbering
      expect(result.html).toContain('Test item');
      expect(result.html).not.toContain('numbering-text');
    });

    it('should handle missing style definitions gracefully', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="NonExistentStyle"/>
              </w:pPr>
              <w:r><w:t>Test item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="SomeOtherStyle">
            <w:pPr>
              <w:numPr>
                <w:numId w:val="1"/>
              </w:numPr>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      // Should not crash
      expect(result.html).toContain('Test item');
      expect(result.html).not.toContain('numbering-text');
    });
  });

  describe('Level text templates', () => {
    it('should apply complex multi-level templates', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Section 1</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Subsection 1.1</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="2"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Item 1.1.1</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
            <w:lvl w:ilvl="1">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1.%2."/>
            </w:lvl>
            <w:lvl w:ilvl="2">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%1.%2.%3."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`);

      const result = transformDocumentToHtml(documentXml, [], [], numberingXml);
      
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
      expect(result.html).toContain('<span class="numbering-text">1.1. </span>');
      expect(result.html).toContain('<span class="numbering-text">1.1.1. </span>');
    });

    it('should handle mixed format templates', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Section I</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="1"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Subsection A</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="2"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>Item 1</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:numFmt w:val="upperRoman"/>
              <w:lvlText w:val="%1."/>
            </w:lvl>
            <w:lvl w:ilvl="1">
              <w:numFmt w:val="upperLetter"/>
              <w:lvlText w:val="%2."/>
            </w:lvl>
            <w:lvl w:ilvl="2">
              <w:numFmt w:val="decimal"/>
              <w:lvlText w:val="%3."/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>`);

      const result = transformDocumentToHtml(documentXml, [], [], numberingXml);
      
      expect(result.html).toContain('<span class="numbering-text">I. </span>');
      expect(result.html).toContain('<span class="numbering-text">A. </span>');
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
    });
  });

  describe('Fallback behavior', () => {
    it('should fallback to decimal when no numbering definition exists', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="999"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined);
      
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
      expect(result.html).toContain('First item');
    });

    it('should work without numbering.xml', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
              </w:pPr>
              <w:r><w:t>First item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const result = transformDocumentToHtml(documentXml);
      
      expect(result.html).toContain('First item');
      // Should still apply numbering with decimal fallback
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
    });

    it('should work without styles.xml', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="SomeStyle"/>
              </w:pPr>
              <w:r><w:t>Test item</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const result = transformDocumentToHtml(documentXml);
      
      expect(result.html).toContain('Test item');
      expect(result.html).not.toContain('numbering-text');
    });
  });
});
