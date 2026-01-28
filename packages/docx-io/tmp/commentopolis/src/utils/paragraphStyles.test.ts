import { describe, it, expect } from 'vitest';
import { transformDocumentToHtml } from './docxHtmlTransformer';

// Helper function to create XML DOM from string
function createXmlDocument(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

describe('Paragraph style application', () => {
  describe('Alignment from styles', () => {
    it('should apply center alignment from paragraph style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="CenteredStyle"/>
              </w:pPr>
              <w:r><w:t>Centered text</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="CenteredStyle">
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('text-align: center');
      expect(result.html).toContain('Centered text');
    });

    it('should apply right alignment from paragraph style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="RightAlignStyle"/>
              </w:pPr>
              <w:r><w:t>Right aligned text</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="RightAlignStyle">
            <w:pPr>
              <w:jc w:val="right"/>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('text-align: right');
      expect(result.html).toContain('Right aligned text');
    });

    it('should apply justify alignment from paragraph style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="JustifyStyle"/>
              </w:pPr>
              <w:r><w:t>Justified text</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="JustifyStyle">
            <w:pPr>
              <w:jc w:val="both"/>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('text-align: justify');
      expect(result.html).toContain('Justified text');
    });
  });

  describe('Indentation from styles', () => {
    it('should apply left indentation from paragraph style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="IndentedStyle"/>
              </w:pPr>
              <w:r><w:t>Indented text</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="IndentedStyle">
            <w:pPr>
              <w:ind w:left="720"/>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('margin-left:');
      expect(result.html).toContain('Indented text');
    });

    it('should apply first-line indentation from paragraph style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="FirstLineStyle"/>
              </w:pPr>
              <w:r><w:t>First line indented</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="FirstLineStyle">
            <w:pPr>
              <w:ind w:firstLine="360"/>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('text-indent:');
      expect(result.html).toContain('First line indented');
    });
  });

  describe('Style hierarchy for paragraph properties', () => {
    it('should inherit alignment from basedOn style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="DerivedStyle"/>
              </w:pPr>
              <w:r><w:t>Inherited alignment</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="BaseStyle">
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
          </w:style>
          <w:style w:styleId="DerivedStyle">
            <w:basedOn w:val="BaseStyle"/>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('text-align: center');
      expect(result.html).toContain('Inherited alignment');
    });

    it('should override parent style properties', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="OverrideStyle"/>
              </w:pPr>
              <w:r><w:t>Overridden alignment</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="BaseStyle">
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
          </w:style>
          <w:style w:styleId="OverrideStyle">
            <w:basedOn w:val="BaseStyle"/>
            <w:pPr>
              <w:jc w:val="right"/>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('text-align: right');
      expect(result.html).not.toContain('text-align: center');
      expect(result.html).toContain('Overridden alignment');
    });
  });

  describe('Direct properties override style properties', () => {
    it('should prioritize direct alignment over style alignment', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="CenteredStyle"/>
                <w:jc w:val="left"/>
              </w:pPr>
              <w:r><w:t>Direct alignment wins</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="CenteredStyle">
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('text-align: left');
      expect(result.html).not.toContain('text-align: center');
      expect(result.html).toContain('Direct alignment wins');
    });

    it('should prioritize direct indentation over style indentation', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="IndentedStyle"/>
                <w:ind w:left="1440"/>
              </w:pPr>
              <w:r><w:t>Direct indent wins</w:t></w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="IndentedStyle">
            <w:pPr>
              <w:ind w:left="720"/>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      // Should have the larger indent from direct properties (1440 twips)
      expect(result.html).toContain('margin-left:');
      expect(result.html).toContain('Direct indent wins');
    });
  });

  describe('Combined style and numbering', () => {
    it('should apply both paragraph style and numbering from style', () => {
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
              <w:ind w:left="720"/>
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
      
      // Should have both numbering and indentation
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
      expect(result.html).toContain('<span class="numbering-text">2. </span>');
      expect(result.html).toContain('margin-left:');
      expect(result.html).toContain('First item');
      expect(result.html).toContain('Second item');
    });
  });
});
