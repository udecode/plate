/**
 * Section Properties - Phase 4.5 Enhanced Properties Tests
 *
 * Tests for newly implemented section properties:
 * - Vertical alignment (vAlign)
 * - Paper source (paperSrc)
 * - Column separator line
 * - Custom column widths
 * - Text direction
 */

import { describe, it, expect } from '@jest/globals';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Document } from '../../src/core/Document';
import { Section } from '../../src/elements/Section';

const OUTPUT_DIR = join(__dirname, '../output');

describe('Section Properties - Phase 4.5 Enhancements', () => {
  describe('Vertical Alignment', () => {
    it('should set and serialize vertical alignment = top', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setVerticalAlignment('top');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-valign-top.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().verticalAlignment).toBe('top');
    });

    it('should set and serialize vertical alignment = center', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setVerticalAlignment('center');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-valign-center.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().verticalAlignment).toBe('center');
    });

    it('should set and serialize vertical alignment = bottom', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setVerticalAlignment('bottom');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-valign-bottom.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().verticalAlignment).toBe('bottom');
    });

    it('should set and serialize vertical alignment = both (justified)', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setVerticalAlignment('both');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-valign-both.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().verticalAlignment).toBe('both');
    });
  });

  describe('Paper Source', () => {
    it('should set and serialize first page tray', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setPaperSource(1, undefined);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-papersrc-first.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().paperSource?.first).toBe(1);
    });

    it('should set and serialize other pages tray', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setPaperSource(undefined, 2);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-papersrc-other.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().paperSource?.other).toBe(2);
    });

    it('should set and serialize both first and other trays', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setPaperSource(1, 3);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-papersrc-both.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().paperSource?.first).toBe(1);
      expect(loadedSection!.getProperties().paperSource?.other).toBe(3);
    });
  });

  describe('Column Separator', () => {
    it('should set and serialize column separator line (enabled)', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setColumns(2, 720);
      section.setColumnSeparator(true);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-col-separator-on.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().columns?.separator).toBe(true);
      expect(loadedSection!.getProperties().columns?.count).toBe(2);
    });

    it('should set and serialize column separator line (disabled)', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setColumns(3, 720);
      section.setColumnSeparator(false);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-col-separator-off.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().columns?.separator).toBe(false);
    });
  });

  describe('Custom Column Widths', () => {
    it('should set and serialize custom column widths', async () => {
      const doc = Document.create();
      const section = Section.create();
      // 3 columns with different widths: 2", 3", 4"
      section.setColumnWidths([2880, 4320, 5760]);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-col-custom-widths.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().columns?.count).toBe(3);
      expect(loadedSection!.getProperties().columns?.equalWidth).toBe(false);
      expect(loadedSection!.getProperties().columns?.columnWidths).toEqual([
        2880, 4320, 5760,
      ]);
    });

    it('should set unequal columns with separator', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setColumnWidths([3000, 6000]);
      section.setColumnSeparator(true);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-col-unequal-sep.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().columns?.count).toBe(2);
      expect(loadedSection!.getProperties().columns?.separator).toBe(true);
      expect(loadedSection!.getProperties().columns?.columnWidths).toEqual([
        3000, 6000,
      ]);
    });
  });

  describe('Text Direction', () => {
    it('should set and serialize text direction = ltr', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setTextDirection('ltr');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-textdir-ltr.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().textDirection).toBe('ltr');
    });

    it('should set and serialize text direction = rtl', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setTextDirection('rtl');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-textdir-rtl.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().textDirection).toBe('rtl');
    });

    it('should set and serialize text direction = tbRl (top-to-bottom, right-to-left)', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setTextDirection('tbRl');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-textdir-tbRl.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().textDirection).toBe('tbRl');
    });

    it('should set and serialize text direction = btLr (bottom-to-top, left-to-right)', async () => {
      const doc = Document.create();
      const section = Section.create();
      section.setTextDirection('btLr');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-textdir-btLr.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      expect(loadedSection!.getProperties().textDirection).toBe('btLr');
    });
  });

  describe('Combined Properties', () => {
    it('should handle all new properties together', async () => {
      const doc = Document.create();
      const section = Section.create();

      // Set all new properties
      section.setVerticalAlignment('center');
      section.setPaperSource(1, 2);
      section.setColumnWidths([3000, 4000, 5000]);
      section.setColumnSeparator(true);
      section.setTextDirection('rtl');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-all-new-props.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      const props = loadedSection!.getProperties();

      expect(props.verticalAlignment).toBe('center');
      expect(props.paperSource?.first).toBe(1);
      expect(props.paperSource?.other).toBe(2);
      expect(props.columns?.count).toBe(3);
      expect(props.columns?.separator).toBe(true);
      expect(props.columns?.columnWidths).toEqual([3000, 4000, 5000]);
      expect(props.textDirection).toBe('rtl');
    });

    it('should preserve new properties with existing properties', async () => {
      const doc = Document.create();
      const section = Section.create();

      // Existing properties
      section.setPageSize(12_240, 15_840, 'portrait');
      section.setMargins({
        top: 1440,
        bottom: 1440,
        left: 1440,
        right: 1440,
        header: 720,
        footer: 720,
      });
      section.setPageNumbering(1, 'decimal');

      // New properties
      section.setVerticalAlignment('bottom');
      section.setTextDirection('ltr');

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-mixed-props.docx'),
        buffer
      );

      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      const props = loadedSection!.getProperties();

      // Check existing properties preserved
      expect(props.pageSize?.width).toBe(12_240);
      expect(props.margins?.top).toBe(1440);
      expect(props.pageNumbering?.start).toBe(1);

      // Check new properties
      expect(props.verticalAlignment).toBe('bottom');
      expect(props.textDirection).toBe('ltr');
    });

    it('should preserve all properties through multiple save/load cycles', async () => {
      const doc = Document.create();
      const section = Section.create();

      section.setVerticalAlignment('center');
      section.setPaperSource(1, 3);
      section.setColumnWidths([2000, 3000]);
      section.setColumnSeparator(true);
      section.setTextDirection('rtl');

      doc.setSection(section);

      // Cycle 1: Save and load
      const buffer1 = await doc.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer1);

      // Cycle 2: Save and load again
      const buffer2 = await doc2.toBuffer();
      await fs.writeFile(
        join(OUTPUT_DIR, 'test-section-multicycle.docx'),
        buffer2
      );

      const doc3 = await Document.loadFromBuffer(buffer2);
      const loadedSection = doc3.getSection();

      expect(loadedSection).toBeDefined();
      const props = loadedSection!.getProperties();

      expect(props.verticalAlignment).toBe('center');
      expect(props.paperSource?.first).toBe(1);
      expect(props.paperSource?.other).toBe(3);
      expect(props.columns?.separator).toBe(true);
      expect(props.columns?.columnWidths).toEqual([2000, 3000]);
      expect(props.textDirection).toBe('rtl');
    });
  });

  describe('Edge Cases', () => {
    it('should handle section without new properties', async () => {
      const doc = Document.create();
      const section = Section.create();

      // Only set basic properties, no new ones
      section.setPageSize(12_240, 15_840);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      const props = loadedSection!.getProperties();

      expect(props.verticalAlignment).toBeUndefined();
      expect(props.paperSource).toBeUndefined();
      expect(props.textDirection).toBeUndefined();
      expect(props.columns?.separator).toBeUndefined();
    });

    it('should handle column separator without custom widths', async () => {
      const doc = Document.create();
      const section = Section.create();

      section.setColumns(2, 720);
      section.setColumnSeparator(true);

      doc.setSection(section);

      const buffer = await doc.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);
      const loadedSection = doc2.getSection();

      expect(loadedSection).toBeDefined();
      const props = loadedSection!.getProperties();

      expect(props.columns?.count).toBe(2);
      expect(props.columns?.separator).toBe(true);
      expect(props.columns?.equalWidth).toBe(true);
      expect(props.columns?.columnWidths).toBeUndefined();
    });
  });
});
