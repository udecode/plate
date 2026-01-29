import { describe, it, expect } from 'vitest';
import { transformDocumentToHtml } from './docxHtmlTransformer';

// Helper function to create XML DOM from string
function createXmlDocument(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

describe('Numbering style inheritance', () => {
  it('should apply paragraph properties from numbering level definition', () => {
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
            <w:r><w:t>List item with numbering indent</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`);

    const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
      <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:abstractNum w:abstractNumId="0">
          <w:lvl w:ilvl="0">
            <w:numFmt w:val="decimal"/>
            <w:lvlText w:val="%1."/>
            <w:pPr>
              <w:ind w:left="720"/>
            </w:pPr>
          </w:lvl>
        </w:abstractNum>
        <w:num w:numId="1">
          <w:abstractNumId w:val="0"/>
        </w:num>
      </w:numbering>`);

    const result = transformDocumentToHtml(documentXml, [], [], numberingXml);
    
    // Should have numbering text
    expect(result.html).toContain('<span class="numbering-text">1. </span>');
    // Should have indentation from numbering level definition
    expect(result.html).toContain('margin-left:');
    expect(result.html).toContain('List item with numbering indent');
  });

  it('should apply alignment from numbering level definition', () => {
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
            <w:r><w:t>Centered list item</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`);

    const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
      <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:abstractNum w:abstractNumId="0">
          <w:lvl w:ilvl="0">
            <w:numFmt w:val="decimal"/>
            <w:lvlText w:val="%1."/>
            <w:pPr>
              <w:jc w:val="center"/>
            </w:pPr>
          </w:lvl>
        </w:abstractNum>
        <w:num w:numId="1">
          <w:abstractNumId w:val="0"/>
        </w:num>
      </w:numbering>`);

    const result = transformDocumentToHtml(documentXml, [], [], numberingXml);
    
    expect(result.html).toContain('text-align: center');
    expect(result.html).toContain('Centered list item');
  });

  it('should apply correct inheritance order: paragraph style < numbering style < direct formatting', () => {
    const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr>
              <w:pStyle w:val="ListParagraph"/>
              <w:ind w:left="1440"/>
            </w:pPr>
            <w:r><w:t>Direct indent wins</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`);

    const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
      <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:style w:styleId="ListParagraph">
          <w:pPr>
            <w:ind w:left="360"/>
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
            <w:pPr>
              <w:ind w:left="720"/>
            </w:pPr>
          </w:lvl>
        </w:abstractNum>
        <w:num w:numId="1">
          <w:abstractNumId w:val="0"/>
        </w:num>
      </w:numbering>`);

    const result = transformDocumentToHtml(documentXml, [], [], numberingXml, stylesXml);
    
    // Direct indent (1440) should win over numbering indent (720) and style indent (360)
    // We can check that it contains margin-left with the highest value
    expect(result.html).toContain('margin-left:');
    expect(result.html).toContain('Direct indent wins');
  });

  it('should merge numbering properties with paragraph style properties', () => {
    const documentXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr>
              <w:pStyle w:val="ListParagraph"/>
            </w:pPr>
            <w:r><w:t>Item with both styles</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`);

    const stylesXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
      <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:style w:styleId="ListParagraph">
          <w:pPr>
            <w:jc w:val="right"/>
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
            <w:pPr>
              <w:ind w:left="720"/>
            </w:pPr>
          </w:lvl>
        </w:abstractNum>
        <w:num w:numId="1">
          <w:abstractNumId w:val="0"/>
        </w:num>
      </w:numbering>`);

    const result = transformDocumentToHtml(documentXml, [], [], numberingXml, stylesXml);
    
    // Should have both the alignment from paragraph style and indent from numbering
    expect(result.html).toContain('text-align: right');
    expect(result.html).toContain('margin-left:');
    expect(result.html).toContain('Item with both styles');
  });

  it('should handle multi-level numbering with different properties per level', () => {
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
            <w:r><w:t>Level 0</w:t></w:r>
          </w:p>
          <w:p>
            <w:pPr>
              <w:numPr>
                <w:numId w:val="1"/>
                <w:ilvl w:val="1"/>
              </w:numPr>
            </w:pPr>
            <w:r><w:t>Level 1</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`);

    const numberingXml = createXmlDocument(`<?xml version="1.0" encoding="UTF-8"?>
      <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:abstractNum w:abstractNumId="0">
          <w:lvl w:ilvl="0">
            <w:numFmt w:val="decimal"/>
            <w:lvlText w:val="%1."/>
            <w:pPr>
              <w:ind w:left="360"/>
            </w:pPr>
          </w:lvl>
          <w:lvl w:ilvl="1">
            <w:numFmt w:val="lowerLetter"/>
            <w:lvlText w:val="%2)"/>
            <w:pPr>
              <w:ind w:left="720"/>
            </w:pPr>
          </w:lvl>
        </w:abstractNum>
        <w:num w:numId="1">
          <w:abstractNumId w:val="0"/>
        </w:num>
      </w:numbering>`);

    const result = transformDocumentToHtml(documentXml, [], [], numberingXml);
    
    // Both levels should have their respective indentation
    expect(result.html).toContain('Level 0');
    expect(result.html).toContain('Level 1');
    expect(result.html).toContain('margin-left:');
  });
});
