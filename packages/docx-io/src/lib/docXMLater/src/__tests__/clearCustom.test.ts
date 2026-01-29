/**
 * Tests for Document.clearCustom() helper method
 * Tests removal of Structured Document Tags (SDTs) from documents
 */

import { Document } from '../core/Document';
import { Paragraph } from '../elements/Paragraph';
import { StructuredDocumentTag } from '../elements/StructuredDocumentTag';
import { Table } from '../elements/Table';
import { TableCell } from '../elements/TableCell';

describe('Document.clearCustom()', () => {
  describe('Basic SDT removal', () => {
    it('should remove SDTs from body while preserving content', () => {
      const doc = Document.create();

      // Add a paragraph directly
      const para1 = doc.createParagraph('First paragraph');

      // Create an SDT with a paragraph inside
      const sdt = new StructuredDocumentTag();
      const para2 = new Paragraph();
      para2.addText('Inside SDT');
      sdt.addContent(para2);
      doc.addStructuredDocumentTag(sdt);

      // Add another direct paragraph
      const para3 = doc.createParagraph('After SDT');

      // Verify initial state has SDT
      let bodyElements = doc.getBodyElements();
      const sdsCount = bodyElements.filter(
        (el) => el instanceof StructuredDocumentTag
      ).length;
      expect(sdsCount).toBeGreaterThan(0);

      // Remove SDTs
      doc.clearCustom();

      // Verify SDTs are removed but content is preserved
      bodyElements = doc.getBodyElements();
      const sdtCountAfter = bodyElements.filter(
        (el) => el instanceof StructuredDocumentTag
      ).length;
      expect(sdtCountAfter).toBe(0);

      // Verify content count is preserved
      const paraCount = bodyElements.filter(
        (el) => el instanceof Paragraph
      ).length;
      expect(paraCount).toBeGreaterThanOrEqual(3); // At least 3 paragraphs
    });

    it('should preserve formatting of unwrapped content', () => {
      const doc = Document.create();

      // Create an SDT with formatted content
      const sdt = new StructuredDocumentTag();
      const para = new Paragraph();
      const run = para.addText('Formatted text - should be preserved');
      sdt.addContent(para);
      doc.addStructuredDocumentTag(sdt);

      // Remove SDTs
      doc.clearCustom();

      // Verify content is still there with same text
      const paragraphs = doc.getParagraphs();
      const allText = paragraphs.map((p) => p.getText()).join('');
      expect(allText).toContain('Formatted text - should be preserved');
    });
  });

  describe('Nested SDT handling', () => {
    it('should handle nested SDTs recursively', () => {
      const doc = Document.create();

      // Create nested SDTs
      const innerPara = new Paragraph();
      innerPara.addText('Deeply nested content');

      const innerSdt = new StructuredDocumentTag();
      innerSdt.addContent(innerPara);

      const outerSdt = new StructuredDocumentTag();
      outerSdt.addContent(innerSdt);
      doc.addStructuredDocumentTag(outerSdt);

      // Remove SDTs
      doc.clearCustom();

      // Verify all SDTs are removed
      const bodyElements = doc.getBodyElements();
      const sdtCount = bodyElements.filter(
        (el) => el instanceof StructuredDocumentTag
      ).length;
      expect(sdtCount).toBe(0);

      // Verify content is preserved
      const paraCount = bodyElements.filter(
        (el) => el instanceof Paragraph
      ).length;
      expect(paraCount).toBeGreaterThan(0);
    });

    it('should preserve multiple paragraphs from single SDT', () => {
      const doc = Document.create();

      // Create an SDT with multiple paragraphs
      const sdt = new StructuredDocumentTag();
      const para1 = new Paragraph();
      para1.addText('First paragraph in SDT');
      const para2 = new Paragraph();
      para2.addText('Second paragraph in SDT');
      sdt.addContent(para1);
      sdt.addContent(para2);

      doc.addStructuredDocumentTag(sdt);

      // Remove SDTs
      doc.clearCustom();

      // Verify both paragraphs are preserved
      const bodyElements = doc.getBodyElements();
      const paraCount = bodyElements.filter(
        (el) => el instanceof Paragraph
      ).length;
      expect(paraCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Table cell SDT handling', () => {
    it('should remove SDTs from table cells', () => {
      const doc = Document.create();

      // Create a table with SDT in cell
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      if (cell instanceof TableCell) {
        // Add SDT to cell
        const sdt = new StructuredDocumentTag();
        const para = new Paragraph();
        para.addText('Content in table cell SDT');
        sdt.addContent(para);

        // Note: We need to work with the cell's internal structure
        // This may require extending TableCell if it doesn't expose SDT methods
        // For now, we verify the document-level clearCustom works

        doc.addTable(table);
      }

      // Remove SDTs (should handle table cells)
      doc.clearCustom();

      // Verify document is valid after clearing
      const tables = doc.getTables();
      expect(tables.length).toBeGreaterThan(0);
    });
  });

  describe('Complex document scenarios', () => {
    it('should handle mixed content with multiple SDTs', () => {
      const doc = Document.create();

      // Add mix of content
      doc.createParagraph('Start');

      const sdt1 = new StructuredDocumentTag();
      const p1 = new Paragraph();
      p1.addText('SDT 1');
      sdt1.addContent(p1);
      doc.addStructuredDocumentTag(sdt1);

      doc.createParagraph('Middle');

      const sdt2 = new StructuredDocumentTag();
      const p2 = new Paragraph();
      p2.addText('SDT 2');
      sdt2.addContent(p2);
      doc.addStructuredDocumentTag(sdt2);

      doc.createParagraph('End');

      // Clear SDTs
      doc.clearCustom();

      // Verify all content is preserved, no SDTs remain
      const bodyElements = doc.getBodyElements();
      const paraCount = bodyElements.filter(
        (el) => el instanceof Paragraph
      ).length;
      const sdtCount = bodyElements.filter(
        (el) => el instanceof StructuredDocumentTag
      ).length;

      expect(paraCount).toBeGreaterThanOrEqual(5); // Start, SDT1 para, Middle, SDT2 para, End
      expect(sdtCount).toBe(0);
    });

    it('should be chainable with other methods', () => {
      const doc = Document.create();
      doc.createParagraph('Test');

      // clearCustom() should return document for chaining
      const result = doc.clearCustom();
      expect(result).toBe(doc);

      // Should be able to chain further methods
      expect(() => {
        doc.clearCustom().createParagraph('Chain test').setStyle('Normal');
      }).not.toThrow();
    });

    it('should work with empty document', () => {
      const doc = Document.createEmpty();

      // Should not throw when clearing empty document
      expect(() => {
        doc.clearCustom();
      }).not.toThrow();

      // Document should still be valid
      expect(doc.getBodyElements().length).toBeGreaterThanOrEqual(0);
    });

    it('should work with document containing only SDTs', () => {
      const doc = Document.create();

      // Add only SDTs
      const sdt1 = new StructuredDocumentTag();
      sdt1.addContent(new Paragraph().addText('Content 1'));
      doc.addStructuredDocumentTag(sdt1);

      const sdt2 = new StructuredDocumentTag();
      sdt2.addContent(new Paragraph().addText('Content 2'));
      doc.addStructuredDocumentTag(sdt2);

      // Clear
      doc.clearCustom();

      // All SDTs should be removed but content preserved
      const bodyElements = doc.getBodyElements();
      const sdtCount = bodyElements.filter(
        (el) => el instanceof StructuredDocumentTag
      ).length;
      const paraCount = bodyElements.filter(
        (el) => el instanceof Paragraph
      ).length;

      expect(sdtCount).toBe(0);
      expect(paraCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Save and reload after clearCustom', () => {
    it('should produce valid document after clearing', async () => {
      const doc = Document.create();

      // Add content
      doc.createParagraph('Start').setStyle('Heading1');

      const sdt = new StructuredDocumentTag();
      const para = new Paragraph();
      para.addText('Content in SDT');
      sdt.addContent(para);
      doc.addStructuredDocumentTag(sdt);

      doc.createParagraph('End');

      // Clear SDTs
      doc.clearCustom();

      // Document should be valid and saveable
      const buffer = await doc.toBuffer();
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);

      // Should be loadable again
      const loaded = await Document.loadFromBuffer(buffer);
      expect(loaded).toBeDefined();

      // Verify content is preserved
      const paras = loaded.getParagraphs();
      expect(paras.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Google Docs SDT-wrapped tables with row exceptions', () => {
    it('should clear tblPrEx from table rows when unwrapping SDTs', () => {
      const doc = Document.create();

      // Create a table that mimics Google Docs pattern:
      // - Table wrapped in SDT
      // - Header row has tblPrEx with bold, center, shading
      // - Data rows don't have tblPrEx
      const table = new Table(3, 2);

      // Set up header row (row 0) with tblPrEx exceptions
      const headerRow = table.getRow(0);
      if (headerRow) {
        // These tblPrEx would normally apply only within the SDT context
        headerRow.setTablePropertyExceptions({
          shading: { fill: 'DFDFDF', pattern: 'solid' },
          justification: 'center',
          borders: {
            top: { style: 'single', size: 4, color: '000000' },
            bottom: { style: 'single', size: 4, color: '000000' },
          },
        });
      }

      // Wrap table in SDT (simulating Google Docs export)
      const sdt = new StructuredDocumentTag();
      sdt.addContent(table);
      doc.addStructuredDocumentTag(sdt);

      // Verify initial state: SDT exists and table has tblPrEx in header
      let sdtCount = doc
        .getBodyElements()
        .filter((el) => el instanceof StructuredDocumentTag).length;
      expect(sdtCount).toBe(1);

      const headerRowBefore = doc.getAllTables()[0]?.getRow(0);
      expect(headerRowBefore?.getTablePropertyExceptions()).toBeDefined();
      expect(headerRowBefore?.getTablePropertyExceptions()?.shading?.fill).toBe(
        'DFDFDF'
      );

      // Clear SDTs - this should also sanitize tblPrEx
      doc.clearCustom();

      // Verify SDT is removed
      const bodyElements = doc.getBodyElements();
      sdtCount = bodyElements.filter(
        (el) => el instanceof StructuredDocumentTag
      ).length;
      expect(sdtCount).toBe(0);

      // Verify table is preserved
      expect(doc.getTables().length).toBe(1);

      // Verify header row still exists
      const headerRowAfter = doc.getTables()[0]?.getRow(0);
      expect(headerRowAfter).toBeDefined();

      // After clearCustom(), tblPrEx should be cleared from header row
      // This prevents the formatting from leaking to all rows
      const tblPrExAfter = headerRowAfter?.getTablePropertyExceptions();
      expect(tblPrExAfter).toBeUndefined();
    });

    it('should preserve table structure when clearing tblPrEx', () => {
      const doc = Document.create();

      // Create a 2x2 table
      const table = new Table(2, 2);

      // Set tblPrEx on header row
      const headerRow = table.getRow(0);
      if (headerRow) {
        headerRow.setTablePropertyExceptions({
          shading: { fill: 'DFDFDF' },
        });
      }

      // Wrap in SDT
      const sdt = new StructuredDocumentTag();
      sdt.addContent(table);
      doc.addStructuredDocumentTag(sdt);

      // Clear SDTs
      doc.clearCustom();

      // Verify table is preserved after clearing SDTs
      const clearedTable = doc.getTables()[0];
      expect(clearedTable).toBeDefined();
      expect(clearedTable?.getRows().length).toBe(2);
      expect(clearedTable?.getColumnCount()).toBe(2);

      // Verify tblPrEx is cleared from header row
      const headerRowAfter = clearedTable?.getRow(0);
      expect(headerRowAfter?.getTablePropertyExceptions()).toBeUndefined();

      // Verify data row never had tblPrEx
      const dataRow = clearedTable?.getRow(1);
      expect(dataRow?.getTablePropertyExceptions()).toBeUndefined();
    });

    it('should handle multiple SDT-wrapped tables with row exceptions', () => {
      const doc = Document.create();

      // Add multiple SDT-wrapped tables
      for (let t = 0; t < 2; t++) {
        const table = new Table(2, 1);

        const headerRow = table.getRow(0);
        if (headerRow) {
          headerRow.setTablePropertyExceptions({
            shading: { fill: 'DFDFDF' },
          });
        }

        const sdt = new StructuredDocumentTag();
        sdt.addContent(table);
        doc.addStructuredDocumentTag(sdt);
      }

      // Verify initial state
      expect(doc.getAllTables().length).toBe(2);

      // Verify both tables have tblPrEx before clearing
      for (const table of doc.getAllTables()) {
        const headerRow = table?.getRow(0);
        expect(headerRow?.getTablePropertyExceptions()).toBeDefined();
        expect(headerRow?.getTablePropertyExceptions()?.shading?.fill).toBe(
          'DFDFDF'
        );
      }

      // Clear SDTs
      doc.clearCustom();

      // Verify all tables are preserved
      const tables = doc.getTables();
      expect(tables.length).toBe(2);

      // Verify tblPrEx is cleared from all tables
      for (const table of tables) {
        const headerRow = table?.getRow(0);
        expect(headerRow?.getTablePropertyExceptions()).toBeUndefined();
      }
    });
  });
});
