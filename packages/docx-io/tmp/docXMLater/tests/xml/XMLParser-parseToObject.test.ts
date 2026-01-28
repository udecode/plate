/**
 * Tests for XMLParser.parseToObject()
 * Comprehensive test suite covering all OOXML parsing scenarios
 */

import { XMLParser } from '../../src/xml/XMLParser';

describe('XMLParser.parseToObject', () => {
  describe('Basic Parsing', () => {
    it('should parse single element with attributes', () => {
      const xml = '<Relationship Id="rId1" Target="https://example.com"/>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result).toEqual({
        Relationship: {
          '@_Id': 'rId1',
          '@_Target': 'https://example.com',
        },
      });
    });

    it('should parse nested elements', () => {
      const xml = '<parent><child><grandchild/></child></parent>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result).toEqual({
        parent: {
          _orderedChildren: [{ type: 'child', index: 0 }],
          child: {
            _orderedChildren: [{ type: 'grandchild', index: 0 }],
            grandchild: {},
          },
        },
      });
    });

    it('should parse self-closing tags', () => {
      const xml = '<tag/>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result).toEqual({
        tag: {},
      });
    });

    it('should parse element with text content', () => {
      const xml = '<message>Hello World</message>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result).toEqual({
        message: 'Hello World',
      });
    });

    it('should parse element with attributes and text', () => {
      const xml = '<message lang="en">Hello</message>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result).toEqual({
        message: {
          '@_lang': 'en',
          '#text': 'Hello',
        },
      });
    });

    it('should handle empty elements', () => {
      const xml = '<empty></empty>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result).toEqual({
        empty: {},
      });
    });
  });

  describe('Relationships XML (Real-world OOXML)', () => {
    it('should parse single Relationship element', () => {
      const xml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
        </Relationships>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(result.Relationships).toBeDefined();
      expect(result.Relationships['@_xmlns']).toBe(
        'http://schemas.openxmlformats.org/package/2006/relationships'
      );
      expect(result.Relationships.Relationship).toEqual({
        '@_Id': 'rId1',
        '@_Type': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
        '@_Target': 'https://example.com',
        '@_TargetMode': 'External',
      });
    });

    it('should parse multiple Relationship elements as array', () => {
      const xml = `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://example.com/hyperlink" Target="https://example.com" TargetMode="External"/>
          <Relationship Id="rId2" Type="http://example.com/hyperlink" Target="https://google.com" TargetMode="External"/>
        </Relationships>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(Array.isArray(result.Relationships.Relationship)).toBe(true);
      expect(result.Relationships.Relationship).toHaveLength(2);
      expect(result.Relationships.Relationship[0]['@_Id']).toBe('rId1');
      expect(result.Relationships.Relationship[1]['@_Id']).toBe('rId2');
    });

    it('should handle single vs array normalization', () => {
      const singleXml = '<Relationships><Relationship Id="rId1"/></Relationships>';
      const multiXml =
        '<Relationships><Relationship Id="rId1"/><Relationship Id="rId2"/></Relationships>';

      const singleResult: any = XMLParser.parseToObject(singleXml);
      const multiResult: any = XMLParser.parseToObject(multiXml);

      // Single element → Object
      expect(typeof singleResult.Relationships.Relationship).toBe('object');
      expect(Array.isArray(singleResult.Relationships.Relationship)).toBe(false);

      // Multiple elements → Array
      expect(Array.isArray(multiResult.Relationships.Relationship)).toBe(true);
    });

    it('should preserve relationship attributes', () => {
      const xml = `
        <Relationships>
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
        </Relationships>
      `;

      const result: any = XMLParser.parseToObject(xml);
      const rels = result.Relationships.Relationship;

      expect(Array.isArray(rels)).toBe(true);
      expect(rels[0]['@_Target']).toBe('styles.xml');
      expect(rels[1]['@_Target']).toBe('numbering.xml');
    });
  });

  describe('Styles XML (Complex Nested)', () => {
    it('should parse WordprocessingML styles', () => {
      const xml = `
        <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:style w:type="paragraph" w:styleId="Heading1">
            <w:name w:val="Heading 1"/>
            <w:basedOn w:val="Normal"/>
          </w:style>
        </w:styles>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(result['w:styles']).toBeDefined();
      expect(result['w:styles']['@_xmlns:w']).toBe(
        'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
      );
      expect(result['w:styles']['w:style']).toBeDefined();
      expect(result['w:styles']['w:style']['@_w:type']).toBe('paragraph');
    });

    it('should preserve namespaces in element names', () => {
      const xml = '<w:p><w:r><w:t>Text</w:t></w:r></w:p>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result['w:p']).toBeDefined();
      expect(result['w:p']['w:r']).toBeDefined();
      expect(result['w:p']['w:r']['w:t']).toBe('Text');
    });

    it('should handle complex nested formatting', () => {
      const xml = `
        <w:style w:type="paragraph">
          <w:pPr>
            <w:spacing w:before="240" w:after="60"/>
          </w:pPr>
          <w:rPr>
            <w:b/>
            <w:sz w:val="32"/>
          </w:rPr>
        </w:style>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(result['w:style']['w:pPr']['w:spacing']['@_w:before']).toBe(240);
      expect(result['w:style']['w:pPr']['w:spacing']['@_w:after']).toBe(60);
      expect(result['w:style']['w:rPr']['w:b']).toEqual({});
      expect(result['w:style']['w:rPr']['w:sz']['@_w:val']).toBe(32);
    });

    it('should handle self-closing formatting tags', () => {
      const xml = `
        <w:rPr>
          <w:b/>
          <w:i/>
          <w:u w:val="single"/>
        </w:rPr>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(result['w:rPr']['w:b']).toEqual({});
      expect(result['w:rPr']['w:i']).toEqual({});
      expect(result['w:rPr']['w:u']).toEqual({ '@_w:val': 'single' });
    });
  });

  describe('Document XML (Text Content)', () => {
    it('should parse paragraph with text', () => {
      const xml = '<w:p><w:r><w:t>Hello World</w:t></w:r></w:p>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result['w:p']['w:r']['w:t']).toBe('Hello World');
    });

    it('should handle #text property for mixed content', () => {
      const xml = '<w:t xml:space="preserve">Hello World</w:t>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result['w:t']['@_xml:space']).toBe('preserve');
      expect(result['w:t']['#text']).toBe('Hello World');
    });

    it('should trim whitespace by default', () => {
      const xml = '<text>  Hello World  </text>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result.text).toBe('Hello World');
    });

    it('should preserve whitespace when trimValues=false', () => {
      const xml = '<text>  Hello World  </text>';
      const result: any = XMLParser.parseToObject(xml, { trimValues: false });

      expect(result.text).toBe('  Hello World  ');
    });

    it('should handle multiple runs', () => {
      const xml = `
        <w:p>
          <w:r><w:t>Hello</w:t></w:r>
          <w:r><w:t> </w:t></w:r>
          <w:r><w:t>World</w:t></w:r>
        </w:p>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(Array.isArray(result['w:p']['w:r'])).toBe(true);
      expect(result['w:p']['w:r']).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty XML', () => {
      const result: any = XMLParser.parseToObject('');
      expect(result).toEqual({});
    });

    it('should handle XML declaration', () => {
      const xml = '<?xml version="1.0" encoding="UTF-8"?><root><item/></root>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result.root).toBeDefined();
      expect(result.root.item).toEqual({});
    });

    it('should handle comments', () => {
      const xml = '<root><!-- This is a comment --><item/></root>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result.root.item).toEqual({});
    });

    it('should handle special characters in text', () => {
      const xml = '<text>&lt;hello&gt; &amp; &quot;world&quot;</text>';
      const result: any = XMLParser.parseToObject(xml);

      // Entities are unescaped during parsing to support proper round-trip behavior
      // This prevents double-escaping when objectToXml writes content back
      expect(result.text).toBe('<hello> & "world"');
    });

    it('should handle numeric attribute values', () => {
      const xml = '<item count="42" price="19.99" active="true"/>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result.item['@_count']).toBe(42);
      expect(result.item['@_price']).toBe(19.99);
      expect(result.item['@_active']).toBe(true);
    });

    it('should handle boolean attribute values', () => {
      const xml = '<item enabled="true" disabled="false"/>';
      const result: any = XMLParser.parseToObject(xml);

      expect(result.item['@_enabled']).toBe(true);
      expect(result.item['@_disabled']).toBe(false);
    });

    it('should handle nested elements with same name', () => {
      const xml = '<list><item>1</item><item>2</item><item>3</item></list>';
      const result: any = XMLParser.parseToObject(xml);

      expect(Array.isArray(result.list.item)).toBe(true);
      expect(result.list.item).toEqual(['1', '2', '3']);
    });

    it('should correctly parse nested self-closing tags with same name (rPrChange bug fix)', () => {
      // This tests the fix for the bug where w:rPr containing w:rPrChange (which itself contains self-closing w:rPr)
      // was incorrectly parsed, causing w:b and w:bCs to be promoted to the wrong level
      const xml = '<w:r><w:rPr><w:b/><w:bCs/><w:rPrChange w:id="1"><w:rPr/></w:rPrChange></w:rPr><w:t>Text</w:t></w:r>';
      const result: any = XMLParser.parseToObject(xml, { trimValues: false });

      // w:b and w:bCs should be inside w:rPr, not siblings of it
      expect(result['w:r']['w:rPr']['w:b']).toEqual({});
      expect(result['w:r']['w:rPr']['w:bCs']).toEqual({});
      expect(result['w:r']['w:rPr']['w:rPrChange']).toBeDefined();
      expect(result['w:r']['w:rPr']['w:rPrChange']['w:rPr']).toEqual({});

      // w:b and w:bCs should NOT be at the w:r level
      expect(result['w:r']['w:b']).toBeUndefined();
      expect(result['w:r']['w:bCs']).toBeUndefined();
    });

    it('should throw on oversized documents', () => {
      const hugeXml = '<root>' + 'x'.repeat(11 * 1024 * 1024) + '</root>';

      expect(() => {
        XMLParser.parseToObject(hugeXml);
      }).toThrow(/XML content too large/);
    });
  });

  describe('Options Configuration', () => {
    it('should ignore attributes when ignoreAttributes=true', () => {
      const xml = '<item id="1" name="test">content</item>';
      const result: any = XMLParser.parseToObject(xml, { ignoreAttributes: true });

      expect(result.item).toBe('content');
      expect(result.item['@_id']).toBeUndefined();
    });

    it('should use custom attribute prefix', () => {
      const xml = '<item id="1"/>';
      const result: any = XMLParser.parseToObject(xml, { attributeNamePrefix: '$' });

      expect(result.item['$id']).toBe(1);
      expect(result.item['@_id']).toBeUndefined();
    });

    it('should use custom text node name', () => {
      const xml = '<item id="1">text</item>';
      const result: any = XMLParser.parseToObject(xml, { textNodeName: '_text' });

      expect(result.item['_text']).toBe('text');
      expect(result.item['#text']).toBeUndefined();
    });

    it('should ignore namespaces when ignoreNamespace=true', () => {
      const xml = '<w:item w:id="123"><w:child>value</w:child></w:item>';
      const result: any = XMLParser.parseToObject(xml, { ignoreNamespace: true });

      // When ignoring namespaces, w: prefix is removed from element names AND attributes
      expect(result.item).toBeDefined();
      expect(result.item['@_id']).toBe(123); // Attribute keeps @_ prefix but namespace stripped
      expect(result.item.child).toBe('value');
      expect(result['w:item']).toBeUndefined();
    });

    it('should not parse attribute values when parseAttributeValue=false', () => {
      const xml = '<item count="42" active="true"/>';
      const result: any = XMLParser.parseToObject(xml, { parseAttributeValue: false });

      expect(result.item['@_count']).toBe('42'); // String, not number
      expect(result.item['@_active']).toBe('true'); // String, not boolean
    });

    it('should always create arrays when alwaysArray=true', () => {
      const xml = '<list><item>single</item></list>';
      const result: any = XMLParser.parseToObject(xml, { alwaysArray: true });

      expect(Array.isArray(result.list.item)).toBe(true);
      expect(result.list.item).toEqual(['single']);
    });

    it('should combine multiple options', () => {
      const xml = '<w:item w:id="1"><w:text>content</w:text></w:item>';
      const result: any = XMLParser.parseToObject(xml, {
        ignoreNamespace: true,
        attributeNamePrefix: '_',
      });

      // Namespaces stripped, attribute prefix applied
      expect(result.item._id).toBe(1);
      expect(result.item.text).toBe('content');
    });
  });

  describe('Real-world OOXML Scenarios', () => {
    it('should parse [Content_Types].xml', () => {
      const xml = `
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(result.Types).toBeDefined();
      expect(Array.isArray(result.Types.Default)).toBe(true);
      expect(result.Types.Default).toHaveLength(2);
      expect(result.Types.Override['@_PartName']).toBe('/word/document.xml');
    });

    it('should parse document.xml structure', () => {
      const xml = `
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p>
              <w:pPr>
                <w:jc w:val="center"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:b/>
                </w:rPr>
                <w:t>Title</w:t>
              </w:r>
            </w:p>
          </w:body>
        </w:document>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(result['w:document']['w:body']['w:p']).toBeDefined();
      expect(result['w:document']['w:body']['w:p']['w:pPr']['w:jc']['@_w:val']).toBe('center');
      expect(result['w:document']['w:body']['w:p']['w:r']['w:rPr']['w:b']).toEqual({});
      expect(result['w:document']['w:body']['w:p']['w:r']['w:t']).toBe('Title');
    });

    it('should parse numbering.xml', () => {
      const xml = `
        <w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:abstractNum w:abstractNumId="0">
            <w:lvl w:ilvl="0">
              <w:start w:val="1"/>
              <w:numFmt w:val="decimal"/>
            </w:lvl>
          </w:abstractNum>
          <w:num w:numId="1">
            <w:abstractNumId w:val="0"/>
          </w:num>
        </w:numbering>
      `;

      const result: any = XMLParser.parseToObject(xml);

      expect(result['w:numbering']['w:abstractNum']['@_w:abstractNumId']).toBe(0);
      expect(result['w:numbering']['w:num']['@_w:numId']).toBe(1);
      expect(result['w:numbering']['w:num']['w:abstractNumId']['@_w:val']).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should parse typical .rels file quickly', () => {
      const xml = `
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
          <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
        </Relationships>
      `;

      const start = Date.now();
      const result: any = XMLParser.parseToObject(xml);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should complete in < 100ms
      expect(Array.isArray(result.Relationships.Relationship)).toBe(true);
      expect(result.Relationships.Relationship).toHaveLength(3);
    });

    it('should handle moderately large documents', () => {
      // Simulate a document with 100 paragraphs
      const paragraphs = Array(100)
        .fill(0)
        .map((_, i) => `<w:p><w:r><w:t>Paragraph ${i}</w:t></w:r></w:p>`)
        .join('');
      const xml = `<w:body>${paragraphs}</w:body>`;

      const start = Date.now();
      const result: any = XMLParser.parseToObject(xml);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500); // Should complete in < 500ms
      expect(Array.isArray(result['w:body']['w:p'])).toBe(true);
      expect(result['w:body']['w:p']).toHaveLength(100);
    });
  });
});
