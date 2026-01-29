import { describe, it, expect } from 'vitest';
import { transformDocumentToHtml } from './docxHtmlTransformer';

// Helper function to create XML DOM from string
function createXmlDocument(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

describe('Character style inheritance', () => {
  describe('Run properties from paragraph properties', () => {
    it('should apply bold from paragraph run properties', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:rPr>
                  <w:b/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Text with paragraph-level bold</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const result = transformDocumentToHtml(documentXml);
      
      expect(result.html).toContain('font-weight: bold');
      expect(result.html).toContain('Text with paragraph-level bold');
    });

    it('should apply italic from paragraph run properties', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:rPr>
                  <w:i/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Text with paragraph-level italic</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const result = transformDocumentToHtml(documentXml);
      
      expect(result.html).toContain('font-style: italic');
      expect(result.html).toContain('Text with paragraph-level italic');
    });

    it('should apply multiple run properties from paragraph', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:rPr>
                  <w:b/>
                  <w:i/>
                  <w:u w:val="single"/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Text with multiple paragraph-level properties</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const result = transformDocumentToHtml(documentXml);
      
      expect(result.html).toContain('font-weight: bold');
      expect(result.html).toContain('font-style: italic');
      expect(result.html).toContain('text-decoration: underline');
      expect(result.html).toContain('Text with multiple paragraph-level properties');
    });
  });

  describe('Run properties from paragraph style', () => {
    it('should apply run properties from paragraph style definition', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="BoldParagraphStyle"/>
              </w:pPr>
              <w:r>
                <w:t>Text styled via paragraph style</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="BoldParagraphStyle">
            <w:pPr>
              <w:rPr>
                <w:b/>
              </w:rPr>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('font-weight: bold');
      expect(result.html).toContain('Text styled via paragraph style');
    });

    it('should inherit run properties from basedOn paragraph style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="DerivedStyle"/>
              </w:pPr>
              <w:r>
                <w:t>Text with inherited style</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="BaseStyle">
            <w:pPr>
              <w:rPr>
                <w:b/>
              </w:rPr>
            </w:pPr>
          </w:style>
          <w:style w:styleId="DerivedStyle">
            <w:basedOn w:val="BaseStyle"/>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('font-weight: bold');
      expect(result.html).toContain('Text with inherited style');
    });

    it('should override basedOn run properties in derived style', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="DerivedStyle"/>
              </w:pPr>
              <w:r>
                <w:t>Overridden text</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="BaseStyle">
            <w:pPr>
              <w:rPr>
                <w:b/>
              </w:rPr>
            </w:pPr>
          </w:style>
          <w:style w:styleId="DerivedStyle">
            <w:basedOn w:val="BaseStyle"/>
            <w:pPr>
              <w:rPr>
                <w:i/>
              </w:rPr>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('font-weight: bold');
      expect(result.html).toContain('font-style: italic');
      expect(result.html).toContain('Overridden text');
    });
  });

  describe('Character style hierarchy', () => {
    it('should apply character style from rStyle reference', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:rStyle w:val="BoldCharStyle"/>
                </w:rPr>
                <w:t>Text with character style</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:type="character" w:styleId="BoldCharStyle">
            <w:rPr>
              <w:b/>
            </w:rPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('font-weight: bold');
      expect(result.html).toContain('Text with character style');
    });

    it('should inherit character style properties from basedOn', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:rStyle w:val="DerivedCharStyle"/>
                </w:rPr>
                <w:t>Inherited character style</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:type="character" w:styleId="BaseCharStyle">
            <w:rPr>
              <w:b/>
            </w:rPr>
          </w:style>
          <w:style w:type="character" w:styleId="DerivedCharStyle">
            <w:basedOn w:val="BaseCharStyle"/>
            <w:rPr>
              <w:i/>
            </w:rPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      expect(result.html).toContain('font-weight: bold');
      expect(result.html).toContain('font-style: italic');
      expect(result.html).toContain('Inherited character style');
    });
  });

  describe('Complete inheritance chain', () => {
    it('should apply inheritance order: paragraph style < paragraph direct < character style < run direct', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="ParagraphStyle"/>
                <w:rPr>
                  <w:sz w:val="24"/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rStyle w:val="CharStyle"/>
                  <w:color w:val="FF0000"/>
                </w:rPr>
                <w:t>Complete inheritance</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="ParagraphStyle">
            <w:pPr>
              <w:rPr>
                <w:b/>
              </w:rPr>
            </w:pPr>
          </w:style>
          <w:style w:type="character" w:styleId="CharStyle">
            <w:rPr>
              <w:i/>
            </w:rPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      // Should have all properties from the inheritance chain
      expect(result.html).toContain('font-weight: bold'); // from paragraph style
      expect(result.html).toContain('font-size: 12pt'); // from paragraph direct (24/2=12pt)
      expect(result.html).toContain('font-style: italic'); // from character style
      expect(result.html).toContain('color: #FF0000'); // from run direct
      expect(result.html).toContain('Complete inheritance');
    });

    it('should override properties at each level', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="ParagraphStyle"/>
                <w:rPr>
                  <w:b/>
                  <w:sz w:val="28"/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:sz w:val="32"/>
                </w:rPr>
                <w:t>Override test</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="ParagraphStyle">
            <w:pPr>
              <w:rPr>
                <w:sz w:val="20"/>
              </w:rPr>
            </w:pPr>
          </w:style>
        </w:styles>`);

      const result = transformDocumentToHtml(documentXml, [], [], undefined, stylesXml);
      
      // Should use the most specific (direct run) font size: 32/2 = 16pt
      expect(result.html).toContain('font-size: 16pt');
      expect(result.html).toContain('font-weight: bold'); // from paragraph direct
      expect(result.html).toContain('Override test');
    });

    it('should handle mixed runs in same paragraph with different inheritance', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:rPr>
                  <w:b/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Bold from paragraph. </w:t>
              </w:r>
              <w:r>
                <w:rPr>
                  <w:i/>
                </w:rPr>
                <w:t>Bold and italic. </w:t>
              </w:r>
              <w:r>
                <w:rPr>
                  <w:b w:val="false"/>
                  <w:u w:val="single"/>
                </w:rPr>
                <w:t>Underlined only.</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const result = transformDocumentToHtml(documentXml);
      
      // First run: should have bold from paragraph
      expect(result.html).toMatch(/Bold from paragraph[^<]*<\/span>/);
      expect(result.html).toContain('font-weight: bold');
      
      // Second run: should have bold from paragraph AND italic from run
      expect(result.html).toMatch(/Bold and italic[^<]*<\/span>/);
      
      // Third run: should NOT have bold (explicitly turned off) but should have underline
      expect(result.html).toMatch(/Underlined only[^<]*<\/span>/);
      expect(result.html).toContain('text-decoration: underline');
    });
  });
});
