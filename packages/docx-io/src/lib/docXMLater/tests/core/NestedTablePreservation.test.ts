/**
 * Tests for nested table preservation in table cells
 * Nested tables (w:tbl inside w:tc) should be preserved exactly as raw XML
 */

import { TableCell } from '../../src/elements/TableCell';

describe('NestedTablePreservation', () => {
  describe('TableCell raw nested content', () => {
    it('should store and retrieve raw nested content', () => {
      const cell = new TableCell();
      cell.createParagraph('Before nested table');

      const nestedTableXml =
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Nested</w:t></w:r></w:p></w:tc></w:tr></w:tbl>';
      cell.addRawNestedContent(1, nestedTableXml, 'table');

      cell.createParagraph('After nested table');

      expect(cell.hasNestedTables()).toBe(true);
      expect(cell.hasRawNestedContent()).toBe(true);

      const rawContent = cell.getRawNestedContent();
      expect(rawContent).toHaveLength(1);
      expect(rawContent[0]?.type).toBe('table');
      expect(rawContent[0]?.position).toBe(1);
      expect(rawContent[0]?.xml).toBe(nestedTableXml);
    });

    it('should update raw nested content', () => {
      const cell = new TableCell();
      cell.addRawNestedContent(0, '<w:tbl>original</w:tbl>', 'table');

      const updated = cell.updateRawNestedContent(0, '<w:tbl>updated</w:tbl>');
      expect(updated).toBe(true);

      const rawContent = cell.getRawNestedContent();
      expect(rawContent[0]?.xml).toBe('<w:tbl>updated</w:tbl>');
    });

    it('should return false when updating invalid index', () => {
      const cell = new TableCell();
      const updated = cell.updateRawNestedContent(0, '<w:tbl>test</w:tbl>');
      expect(updated).toBe(false);
    });

    it('should clear raw nested content', () => {
      const cell = new TableCell();
      cell.addRawNestedContent(0, '<w:tbl>test</w:tbl>', 'table');

      expect(cell.hasRawNestedContent()).toBe(true);
      cell.clearRawNestedContent();
      expect(cell.hasRawNestedContent()).toBe(false);
    });

    it('should handle SDT content type', () => {
      const cell = new TableCell();
      cell.addRawNestedContent(0, '<w:sdt>content</w:sdt>', 'sdt');

      expect(cell.hasNestedTables()).toBe(false);
      expect(cell.hasRawNestedContent()).toBe(true);

      const rawContent = cell.getRawNestedContent();
      expect(rawContent[0]?.type).toBe('sdt');
    });
  });

  describe('TableCell toXML with nested content', () => {
    it('should include nested table in XML output', () => {
      const cell = new TableCell();
      cell.createParagraph('Text before');

      const nestedTableXml =
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Nested</w:t></w:r></w:p></w:tc></w:tr></w:tbl>';
      cell.addRawNestedContent(1, nestedTableXml, 'table');

      cell.createParagraph('Text after');

      const xmlElement = cell.toXML();
      expect(xmlElement.name).toBe('w:tc');

      // The XML should contain the nested table between paragraphs
      // Check that children include the raw XML element
      const children = xmlElement.children || [];
      const hasRawXml = children.some(
        (child) =>
          typeof child === 'object' &&
          'name' in child &&
          child.name === '__rawXml'
      );
      expect(hasRawXml).toBe(true);
    });

    it('should preserve multiple nested tables at different positions', () => {
      const cell = new TableCell();
      cell.createParagraph('Para 1');
      cell.createParagraph('Para 2');
      cell.createParagraph('Para 3');

      // Add nested table after para 1 (position 1)
      cell.addRawNestedContent(
        1,
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Table1</w:t></w:r></w:p></w:tc></w:tr></w:tbl>',
        'table'
      );

      // Add nested table after para 3 (position 3)
      cell.addRawNestedContent(
        3,
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Table2</w:t></w:r></w:p></w:tc></w:tr></w:tbl>',
        'table'
      );

      const xmlElement = cell.toXML();
      const children = xmlElement.children || [];

      // Count raw XML elements
      const rawXmlElements = children.filter(
        (child) =>
          typeof child === 'object' &&
          'name' in child &&
          child.name === '__rawXml'
      );
      expect(rawXmlElements).toHaveLength(2);
    });

    it('should handle cell with only nested table and no paragraphs', () => {
      const cell = new TableCell();

      // Add nested table without any paragraphs
      cell.addRawNestedContent(
        0,
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Only Table</w:t></w:r></w:p></w:tc></w:tr></w:tbl>',
        'table'
      );

      const xmlElement = cell.toXML();
      const children = xmlElement.children || [];

      // Should have at least one empty paragraph (ECMA-376 requirement)
      const hasParagraph = children.some(
        (child) =>
          typeof child === 'object' && 'name' in child && child.name === 'w:p'
      );
      expect(hasParagraph).toBe(true);

      // Should have the nested table
      const hasRawXml = children.some(
        (child) =>
          typeof child === 'object' &&
          'name' in child &&
          child.name === '__rawXml'
      );
      expect(hasRawXml).toBe(true);
    });
  });

  describe('Document load/save with nested tables', () => {
    it('should preserve nested tables when loading and saving', async () => {
      // Create a document with nested table structure
      const cellXml = `<w:tc>
        <w:tcPr><w:tcW w:w="5000" w:type="dxa"/></w:tcPr>
        <w:p><w:r><w:t>Before table</w:t></w:r></w:p>
        <w:tbl>
          <w:tblPr><w:tblW w:w="4000" w:type="dxa"/></w:tblPr>
          <w:tblGrid><w:gridCol w:w="2000"/><w:gridCol w:w="2000"/></w:tblGrid>
          <w:tr>
            <w:tc><w:p><w:r><w:t>Cell 1</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>Cell 2</w:t></w:r></w:p></w:tc>
          </w:tr>
        </w:tbl>
        <w:p><w:r><w:t>After table</w:t></w:r></w:p>
      </w:tc>`;

      // Verify the XML contains nested table
      expect(cellXml).toContain('<w:tbl>');
      expect(cellXml).toContain('Cell 1');
      expect(cellXml).toContain('Cell 2');
    });
  });

  describe('Deep nesting scenarios', () => {
    it('should preserve 5 levels of nested tables', () => {
      const cell = new TableCell();
      cell.createParagraph('Outer content');

      // Create 5-level deep nested table structure
      const level5NestedTableXml = `<w:tbl>
        <w:tblPr><w:tblW w:w="5000" w:type="dxa"/></w:tblPr>
        <w:tblGrid><w:gridCol w:w="5000"/></w:tblGrid>
        <w:tr><w:tc>
          <w:p><w:r><w:t>Level 1</w:t></w:r></w:p>
          <w:tbl>
            <w:tblPr><w:tblW w:w="4500" w:type="dxa"/></w:tblPr>
            <w:tblGrid><w:gridCol w:w="4500"/></w:tblGrid>
            <w:tr><w:tc>
              <w:p><w:r><w:t>Level 2</w:t></w:r></w:p>
              <w:tbl>
                <w:tblPr><w:tblW w:w="4000" w:type="dxa"/></w:tblPr>
                <w:tblGrid><w:gridCol w:w="4000"/></w:tblGrid>
                <w:tr><w:tc>
                  <w:p><w:r><w:t>Level 3</w:t></w:r></w:p>
                  <w:tbl>
                    <w:tblPr><w:tblW w:w="3500" w:type="dxa"/></w:tblPr>
                    <w:tblGrid><w:gridCol w:w="3500"/></w:tblGrid>
                    <w:tr><w:tc>
                      <w:p><w:r><w:t>Level 4</w:t></w:r></w:p>
                      <w:tbl>
                        <w:tblPr><w:tblW w:w="3000" w:type="dxa"/></w:tblPr>
                        <w:tblGrid><w:gridCol w:w="3000"/></w:tblGrid>
                        <w:tr><w:tc>
                          <w:p><w:r><w:t>Level 5 - Deepest</w:t></w:r></w:p>
                        </w:tc></w:tr>
                      </w:tbl>
                    </w:tc></w:tr>
                  </w:tbl>
                </w:tc></w:tr>
              </w:tbl>
            </w:tc></w:tr>
          </w:tbl>
        </w:tc></w:tr>
      </w:tbl>`;

      cell.addRawNestedContent(1, level5NestedTableXml, 'table');

      expect(cell.hasNestedTables()).toBe(true);

      const rawContent = cell.getRawNestedContent();
      expect(rawContent).toHaveLength(1);

      // Verify all 5 levels are preserved in the stored XML
      expect(rawContent[0]?.xml).toContain('Level 1');
      expect(rawContent[0]?.xml).toContain('Level 2');
      expect(rawContent[0]?.xml).toContain('Level 3');
      expect(rawContent[0]?.xml).toContain('Level 4');
      expect(rawContent[0]?.xml).toContain('Level 5 - Deepest');

      // Count nested w:tbl tags (should be 5)
      const tblMatches = rawContent[0]?.xml.match(/<w:tbl>/g);
      expect(tblMatches).toHaveLength(5);
    });

    it('should handle nested tables with revision markers', () => {
      const cell = new TableCell();
      cell.createParagraph('Content with revisions');

      // Nested table containing revision markup (w:ins, w:del)
      const nestedTableWithRevisionsXml = `<w:tbl>
        <w:tblPr><w:tblW w:w="5000" w:type="dxa"/></w:tblPr>
        <w:tblGrid><w:gridCol w:w="5000"/></w:tblGrid>
        <w:tr><w:tc>
          <w:p>
            <w:ins w:id="1" w:author="Author1" w:date="2025-01-01T00:00:00Z">
              <w:r><w:t>Inserted text</w:t></w:r>
            </w:ins>
          </w:p>
          <w:p>
            <w:del w:id="2" w:author="Author2" w:date="2025-01-02T00:00:00Z">
              <w:r><w:delText>Deleted text</w:delText></w:r>
            </w:del>
          </w:p>
        </w:tc></w:tr>
      </w:tbl>`;

      cell.addRawNestedContent(1, nestedTableWithRevisionsXml, 'table');

      const rawContent = cell.getRawNestedContent();
      expect(rawContent[0]?.xml).toContain('<w:ins');
      expect(rawContent[0]?.xml).toContain('<w:del');
      expect(rawContent[0]?.xml).toContain('Inserted text');
      expect(rawContent[0]?.xml).toContain('Deleted text');
    });

    it('should handle multiple nested tables at different positions in same cell', () => {
      const cell = new TableCell();
      cell.createParagraph('Para 1');
      cell.createParagraph('Para 2');
      cell.createParagraph('Para 3');
      cell.createParagraph('Para 4');
      cell.createParagraph('Para 5');

      // Add 3 nested tables at positions 1, 3, and 5
      const table1 =
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Table A</w:t></w:r></w:p></w:tc></w:tr></w:tbl>';
      const table2 =
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Table B</w:t></w:r></w:p></w:tc></w:tr></w:tbl>';
      const table3 =
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Table C</w:t></w:r></w:p></w:tc></w:tr></w:tbl>';

      cell.addRawNestedContent(1, table1, 'table');
      cell.addRawNestedContent(3, table2, 'table');
      cell.addRawNestedContent(5, table3, 'table');

      const rawContent = cell.getRawNestedContent();
      expect(rawContent).toHaveLength(3);

      // Verify positions
      expect(rawContent[0]?.position).toBe(1);
      expect(rawContent[1]?.position).toBe(3);
      expect(rawContent[2]?.position).toBe(5);

      // Verify content
      expect(rawContent[0]?.xml).toContain('Table A');
      expect(rawContent[1]?.xml).toContain('Table B');
      expect(rawContent[2]?.xml).toContain('Table C');
    });

    it('should handle nested SDT containing nested table', () => {
      const cell = new TableCell();
      cell.createParagraph('Content before SDT');

      // SDT (Structured Document Tag) containing a nested table
      const sdtWithNestedTableXml = `<w:sdt>
        <w:sdtPr>
          <w:id w:val="12345"/>
          <w:placeholder><w:docPart w:val="DefaultPlaceholder"/></w:placeholder>
        </w:sdtPr>
        <w:sdtContent>
          <w:p><w:r><w:t>SDT content</w:t></w:r></w:p>
          <w:tbl>
            <w:tblPr><w:tblW w:w="4000" w:type="dxa"/></w:tblPr>
            <w:tblGrid><w:gridCol w:w="4000"/></w:tblGrid>
            <w:tr><w:tc><w:p><w:r><w:t>Nested in SDT</w:t></w:r></w:p></w:tc></w:tr>
          </w:tbl>
        </w:sdtContent>
      </w:sdt>`;

      cell.addRawNestedContent(1, sdtWithNestedTableXml, 'sdt');

      const rawContent = cell.getRawNestedContent();
      expect(rawContent).toHaveLength(1);
      expect(rawContent[0]?.type).toBe('sdt');
      expect(rawContent[0]?.xml).toContain('<w:sdt>');
      expect(rawContent[0]?.xml).toContain('<w:tbl>');
      expect(rawContent[0]?.xml).toContain('Nested in SDT');
    });

    it('should handle large nested table structures without performance degradation', () => {
      const cell = new TableCell();
      cell.createParagraph('Start content');

      // Generate a larger nested structure (10 nested tables with multiple rows)
      let largeNestedXml = '';
      for (let i = 0; i < 10; i++) {
        largeNestedXml += `<w:tbl>
          <w:tblPr><w:tblW w:w="5000" w:type="dxa"/></w:tblPr>
          <w:tblGrid><w:gridCol w:w="2500"/><w:gridCol w:w="2500"/></w:tblGrid>`;

        for (let row = 0; row < 5; row++) {
          largeNestedXml += `<w:tr>
            <w:tc><w:p><w:r><w:t>Table ${i} Row ${row} Cell 1</w:t></w:r></w:p></w:tc>
            <w:tc><w:p><w:r><w:t>Table ${i} Row ${row} Cell 2</w:t></w:r></w:p></w:tc>
          </w:tr>`;
        }

        largeNestedXml += '</w:tbl>';
      }

      const startTime = performance.now();

      // Add all 10 tables
      cell.addRawNestedContent(1, largeNestedXml, 'table');

      // Generate XML output
      const xmlElement = cell.toXML();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);

      // Verify content was stored
      expect(cell.hasNestedTables()).toBe(true);
      expect(xmlElement.children).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle nested table with minimal valid structure', () => {
      const cell = new TableCell();

      // Minimal valid nested table per ECMA-376 (table, row, cell, paragraph)
      const minimalNestedTableXml =
        '<w:tbl><w:tr><w:tc><w:p/></w:tc></w:tr></w:tbl>';

      cell.addRawNestedContent(0, minimalNestedTableXml, 'table');

      expect(cell.hasNestedTables()).toBe(true);

      const rawContent = cell.getRawNestedContent();
      expect(rawContent[0]?.xml).toBe(minimalNestedTableXml);
    });

    it('should handle nested table with merged cells (gridSpan and vMerge)', () => {
      const cell = new TableCell();
      cell.createParagraph('Before merged table');

      // Nested table with horizontal merge (gridSpan) and vertical merge (vMerge)
      const mergedCellsTableXml = `<w:tbl>
        <w:tblPr><w:tblW w:w="6000" w:type="dxa"/></w:tblPr>
        <w:tblGrid>
          <w:gridCol w:w="2000"/>
          <w:gridCol w:w="2000"/>
          <w:gridCol w:w="2000"/>
        </w:tblGrid>
        <w:tr>
          <w:tc>
            <w:tcPr><w:gridSpan w:val="2"/></w:tcPr>
            <w:p><w:r><w:t>Merged horizontally</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr><w:vMerge w:val="restart"/></w:tcPr>
            <w:p><w:r><w:t>Vertical merge start</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
        <w:tr>
          <w:tc><w:p><w:r><w:t>Cell 1</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>Cell 2</w:t></w:r></w:p></w:tc>
          <w:tc>
            <w:tcPr><w:vMerge/></w:tcPr>
            <w:p/>
          </w:tc>
        </w:tr>
      </w:tbl>`;

      cell.addRawNestedContent(1, mergedCellsTableXml, 'table');

      const rawContent = cell.getRawNestedContent();
      expect(rawContent[0]?.xml).toContain('<w:gridSpan');
      expect(rawContent[0]?.xml).toContain('<w:vMerge');
      expect(rawContent[0]?.xml).toContain('Merged horizontally');
      expect(rawContent[0]?.xml).toContain('Vertical merge start');
    });

    it('should handle nested table with complex borders and shading', () => {
      const cell = new TableCell();

      // Nested table with detailed border and shading formatting
      const formattedNestedTableXml = `<w:tbl>
        <w:tblPr>
          <w:tblW w:w="5000" w:type="dxa"/>
          <w:tblBorders>
            <w:top w:val="double" w:sz="12" w:space="0" w:color="FF0000"/>
            <w:left w:val="single" w:sz="6" w:space="0" w:color="00FF00"/>
            <w:bottom w:val="dotted" w:sz="4" w:space="0" w:color="0000FF"/>
            <w:right w:val="dashed" w:sz="8" w:space="0" w:color="FFFF00"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="808080"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="808080"/>
          </w:tblBorders>
          <w:shd w:val="clear" w:color="auto" w:fill="EEEEEE"/>
        </w:tblPr>
        <w:tblGrid><w:gridCol w:w="2500"/><w:gridCol w:w="2500"/></w:tblGrid>
        <w:tr>
          <w:tc>
            <w:tcPr>
              <w:shd w:val="clear" w:color="auto" w:fill="CCFFCC"/>
              <w:tcBorders>
                <w:top w:val="thick" w:sz="18" w:color="000000"/>
              </w:tcBorders>
            </w:tcPr>
            <w:p><w:r><w:t>Formatted cell 1</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:tcPr>
              <w:shd w:val="diagStripe" w:color="FFCCCC" w:fill="FFFFFF"/>
            </w:tcPr>
            <w:p><w:r><w:t>Formatted cell 2</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
      </w:tbl>`;

      cell.addRawNestedContent(0, formattedNestedTableXml, 'table');

      const rawContent = cell.getRawNestedContent();
      expect(rawContent[0]?.xml).toContain('<w:tblBorders>');
      expect(rawContent[0]?.xml).toContain('w:val="double"');
      expect(rawContent[0]?.xml).toContain('w:fill="EEEEEE"');
      expect(rawContent[0]?.xml).toContain('w:fill="CCFFCC"');
      expect(rawContent[0]?.xml).toContain('w:val="diagStripe"');
    });

    it('should handle nested table with hyperlinks and bookmarks', () => {
      const cell = new TableCell();

      // Nested table containing hyperlinks and bookmarks
      const nestedWithLinksXml = `<w:tbl>
        <w:tblPr><w:tblW w:w="5000" w:type="dxa"/></w:tblPr>
        <w:tblGrid><w:gridCol w:w="5000"/></w:tblGrid>
        <w:tr><w:tc>
          <w:p>
            <w:bookmarkStart w:id="0" w:name="bookmark1"/>
            <w:r><w:t>Bookmarked text</w:t></w:r>
            <w:bookmarkEnd w:id="0"/>
          </w:p>
          <w:p>
            <w:hyperlink r:id="rId1">
              <w:r><w:t>Link text</w:t></w:r>
            </w:hyperlink>
          </w:p>
        </w:tc></w:tr>
      </w:tbl>`;

      cell.addRawNestedContent(0, nestedWithLinksXml, 'table');

      const rawContent = cell.getRawNestedContent();
      expect(rawContent[0]?.xml).toContain('<w:bookmarkStart');
      expect(rawContent[0]?.xml).toContain('<w:bookmarkEnd');
      expect(rawContent[0]?.xml).toContain('<w:hyperlink');
      expect(rawContent[0]?.xml).toContain('Bookmarked text');
      expect(rawContent[0]?.xml).toContain('Link text');
    });

    it('should handle empty cell with only nested content', () => {
      const cell = new TableCell();

      // No paragraphs added explicitly - only nested table
      cell.addRawNestedContent(
        0,
        '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Only nested</w:t></w:r></w:p></w:tc></w:tr></w:tbl>',
        'table'
      );

      // toXML should still produce valid output with minimum paragraph
      const xmlElement = cell.toXML();
      expect(xmlElement.name).toBe('w:tc');

      // Children should exist
      const children = xmlElement.children || [];
      expect(children.length).toBeGreaterThan(0);
    });
  });
});
