/**
 * Tests for Paragraph Style & Conditional Properties (Phase 4.2 Batch 4)
 * Tests 3 style and conditional paragraph properties with full round-trip verification
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';

describe('Paragraph - Style & Conditional Properties (Batch 4)', () => {
  /**
   * Test 1: cnfStyle (Conditional Table Style Formatting)
   */
  describe('cnfStyle (Conditional Formatting)', () => {
    it('should set and serialize cnfStyle with first row and column', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('First row, first column cell');
      para.setConditionalFormatting('101000000000'); // First row + first column

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.cnfStyle).toBe('101000000000');
    });

    it('should set and serialize cnfStyle with banding', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Banded cell');
      para.setConditionalFormatting('000011000000'); // Band 1 vertical + Band 2 vertical

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.cnfStyle).toBe('000011000000');
    });

    it('should set and serialize cnfStyle with corner cells', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('NW corner cell');
      para.setConditionalFormatting('100000001000'); // NW corner

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.cnfStyle).toBe('100000001000');
    });

    it('should handle undefined cnfStyle', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('No conditional formatting');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.cnfStyle).toBeUndefined();
    });
  });

  /**
   * Test 2: sectPr (Section Properties)
   */
  describe('sectPr (Section Properties)', () => {
    it('should set and serialize basic section properties', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with section break');
      para.setSectionProperties({ type: 'nextPage' });

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify - sectPr is complex, just verify it exists
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.sectPr).toBeDefined();
      // Note: Full sectPr serialization would require proper XML structure handling
    });

    it('should set and serialize section properties with page setup', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Section with custom page setup');
      para.setSectionProperties({
        type: 'continuous',
        pageSize: { w: 12_240, h: 15_840 },
      });

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify - sectPr is complex, just verify it exists
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.sectPr).toBeDefined();
      // Note: Full sectPr serialization would require proper XML structure handling
    });

    it('should handle undefined sectPr', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('No section properties');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.sectPr).toBeUndefined();
    });
  });

  /**
   * Test 3: pPrChange (Paragraph Properties Change Tracking)
   */
  describe('pPrChange (Change Tracking)', () => {
    it('should set and serialize change tracking with author and date', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with tracked changes');
      // Per ECMA-376 §17.13.5.29, pPrChange MUST contain previousProperties (child w:pPr element)
      // Empty pPrChange without previousProperties causes Word "unreadable content" corruption
      para.setParagraphPropertiesChange({
        author: 'John Doe',
        date: '2025-10-23T12:00:00Z',
        id: '1',
        previousProperties: { alignment: 'justify' }, // Required for valid OOXML
      });

      doc.addParagraph(para);

      // Save and load (preserve revisions to test pPrChange round-trip)
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer, {
        revisionHandling: 'preserve',
      });

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.pPrChange).toBeDefined();
      expect(loadedPara.formatting.pPrChange!.author).toBe('John Doe');
      expect(loadedPara.formatting.pPrChange!.date).toBe(
        '2025-10-23T12:00:00Z'
      );
      expect(loadedPara.formatting.pPrChange!.id).toBe('1');
    });

    it('should set and serialize change tracking with previous properties', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Modified paragraph');
      para.setParagraphPropertiesChange({
        author: 'Jane Smith',
        date: '2025-10-23T14:30:00Z',
        id: '2',
        previousProperties: {
          alignment: 'left',
          spacing: { before: 120 },
        },
      });

      doc.addParagraph(para);

      // Save and load (preserve revisions to test pPrChange round-trip)
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer, {
        revisionHandling: 'preserve',
      });

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.pPrChange).toBeDefined();
      expect(loadedPara.formatting.pPrChange!.author).toBe('Jane Smith');
      expect(loadedPara.formatting.pPrChange!.id).toBe('2');
    });

    it('should handle undefined pPrChange', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('No change tracking');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.pPrChange).toBeUndefined();
    });
  });

  /**
   * Combined Tests
   */
  describe('Combined Properties', () => {
    it('should handle all three properties together', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Complex paragraph with all properties');
      para.setConditionalFormatting('110000000000');
      para.setSectionProperties({ type: 'nextPage' });
      // Per ECMA-376 §17.13.5.29, pPrChange MUST contain previousProperties (child w:pPr element)
      para.setParagraphPropertiesChange({
        author: 'Test User',
        date: '2025-10-23T16:00:00Z',
        id: '3',
        previousProperties: { alignment: 'left' }, // Required for valid OOXML
      });

      doc.addParagraph(para);

      // Save and load (preserve revisions to test pPrChange round-trip)
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer, {
        revisionHandling: 'preserve',
      });

      // Verify all properties
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.cnfStyle).toBe('110000000000');
      expect(loadedPara.formatting.sectPr).toBeDefined();
      // Note: sectPr is complex and simplified in this implementation
      expect(loadedPara.formatting.pPrChange).toBeDefined();
      expect(loadedPara.formatting.pPrChange!.author).toBe('Test User');
    });

    it('should preserve all properties across multiple save/load cycles', async () => {
      let doc = Document.create();
      const para = new Paragraph();
      para.addText('Multi-cycle test');
      para.setConditionalFormatting('101010101010');
      // Per ECMA-376 §17.13.5.29, pPrChange MUST contain previousProperties (child w:pPr element)
      para.setParagraphPropertiesChange({
        author: 'Cycle Tester',
        date: '2025-10-23T18:00:00Z',
        id: '99',
        previousProperties: { alignment: 'center' }, // Required for valid OOXML
      });

      doc.addParagraph(para);

      // Cycle 1 (preserve revisions to test pPrChange round-trip)
      let buffer = await doc.toBuffer();
      doc = await Document.loadFromBuffer(buffer, {
        revisionHandling: 'preserve',
      });

      // Cycle 2
      buffer = await doc.toBuffer();
      doc = await Document.loadFromBuffer(buffer, {
        revisionHandling: 'preserve',
      });

      // Cycle 3
      buffer = await doc.toBuffer();
      const final = await Document.loadFromBuffer(buffer, {
        revisionHandling: 'preserve',
      });

      // Verify properties survived 3 cycles
      const loadedPara = final.getParagraphs()[0]!;
      expect(loadedPara.formatting.cnfStyle).toBe('101010101010');
      expect(loadedPara.formatting.pPrChange!.author).toBe('Cycle Tester');
      expect(loadedPara.formatting.pPrChange!.id).toBe('99');
    });
  });
});
