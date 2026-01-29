import { describe, it, expect } from 'vitest';
import { transformDocumentToHtml } from './docxHtmlTransformer';

// Helper function to create XML DOM from string
function createXmlDocument(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

describe('Numbering run styles', () => {
  describe('Direct paragraph run properties', () => {
    it('should apply bold from paragraph run properties to numbering', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
                <w:rPr>
                  <w:b/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Bold numbered item</w:t>
              </w:r>
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
      
      // Numbering text should have bold style
      expect(result.html).toMatch(/<span class="numbering-text"[^>]*style="[^"]*font-weight: bold/);
      expect(result.html).toContain('1. ');
    });

    it('should apply italic from paragraph run properties to numbering', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
                <w:rPr>
                  <w:i/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Italic numbered item</w:t>
              </w:r>
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
      
      // Numbering text should have italic style
      expect(result.html).toMatch(/<span class="numbering-text"[^>]*style="[^"]*font-style: italic/);
      expect(result.html).toContain('1. ');
    });

    it('should apply color from paragraph run properties to numbering', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
                <w:rPr>
                  <w:color w:val="0000FF"/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Blue numbered item</w:t>
              </w:r>
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
      
      // Numbering text should have blue color
      expect(result.html).toMatch(/<span class="numbering-text"[^>]*style="[^"]*color: #0000FF/);
      expect(result.html).toContain('1. ');
    });

    it('should apply multiple run properties to numbering', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
                <w:rPr>
                  <w:b/>
                  <w:i/>
                  <w:color w:val="FF0000"/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Bold italic red numbered item</w:t>
              </w:r>
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
      
      // Numbering text should have all styles
      const numberingSpan = result.html.match(/<span class="numbering-text"[^>]*style="([^"]*)"/);
      expect(numberingSpan).toBeTruthy();
      const styles = numberingSpan![1];
      expect(styles).toContain('font-weight: bold');
      expect(styles).toContain('font-style: italic');
      expect(styles).toContain('color: #FF0000');
    });
  });

  describe('Style-based run properties', () => {
    it('should apply run properties from paragraph style to numbering', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="BoldListStyle"/>
              </w:pPr>
              <w:r>
                <w:t>Styled numbered item</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="BoldListStyle">
            <w:pPr>
              <w:numPr>
                <w:numId w:val="1"/>
                <w:ilvl w:val="0"/>
              </w:numPr>
            </w:pPr>
            <w:rPr>
              <w:b/>
              <w:color w:val="0000FF"/>
            </w:rPr>
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
      
      // Numbering text should have bold and blue from style
      const numberingSpan = result.html.match(/<span class="numbering-text"[^>]*style="([^"]*)"/);
      expect(numberingSpan).toBeTruthy();
      const styles = numberingSpan![1];
      expect(styles).toContain('font-weight: bold');
      expect(styles).toContain('color: #0000FF');
    });

    it('should merge style run properties with direct paragraph run properties', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:pStyle w:val="BoldListStyle"/>
                <w:rPr>
                  <w:i/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Bold and italic numbered item</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>`);

      const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:styleId="BoldListStyle">
            <w:pPr>
              <w:numPr>
                <w:numId w:val="1"/>
                <w:ilvl w:val="0"/>
              </w:numPr>
            </w:pPr>
            <w:rPr>
              <w:b/>
            </w:rPr>
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
      
      // Numbering text should have both bold (from style) and italic (from direct)
      const numberingSpan = result.html.match(/<span class="numbering-text"[^>]*style="([^"]*)"/);
      expect(numberingSpan).toBeTruthy();
      const styles = numberingSpan![1];
      expect(styles).toContain('font-weight: bold');
      expect(styles).toContain('font-style: italic');
    });
  });

  describe('Multi-level numbering with styles', () => {
    it('should apply run properties to multi-level numbering', () => {
      const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="0"/>
                </w:numPr>
                <w:rPr>
                  <w:b/>
                  <w:color w:val="0000FF"/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Level 1 heading</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:numPr>
                  <w:numId w:val="1"/>
                  <w:ilvl w:val="1"/>
                </w:numPr>
                <w:rPr>
                  <w:i/>
                  <w:color w:val="008000"/>
                </w:rPr>
              </w:pPr>
              <w:r>
                <w:t>Level 2 item</w:t>
              </w:r>
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
      
      // Check level 1 numbering has blue bold
      expect(result.html).toMatch(/<span class="numbering-text"[^>]*style="[^"]*font-weight: bold[^"]*"[^>]*>1\. <\/span>/);
      expect(result.html).toMatch(/<span class="numbering-text"[^>]*style="[^"]*color: #0000FF[^"]*"[^>]*>1\. <\/span>/);
      
      // Check level 2 numbering has green italic
      expect(result.html).toMatch(/<span class="numbering-text"[^>]*style="[^"]*font-style: italic[^"]*"[^>]*>1\.a\) <\/span>/);
      expect(result.html).toMatch(/<span class="numbering-text"[^>]*style="[^"]*color: #008000[^"]*"[^>]*>1\.a\) <\/span>/);
    });
  });

  describe('No styles on numbering when not specified', () => {
    it('should not apply run styles to numbering when paragraph has no run properties', () => {
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
              <w:r>
                <w:t>Plain numbered item</w:t>
              </w:r>
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
      
      // Numbering text should not have style attribute or should be empty
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
    });

    it('should not apply direct run properties to numbering (only paragraph-level)', () => {
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
              <w:r>
                <w:rPr>
                  <w:b/>
                </w:rPr>
                <w:t>Bold text but plain numbering</w:t>
              </w:r>
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
      
      // Numbering should not have bold (run-level property), but text should
      expect(result.html).toContain('<span class="numbering-text">1. </span>');
      expect(result.html).toMatch(/Bold text but plain numbering<\/span>/);
    });
  });
});
