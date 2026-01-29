/**
 * Tests for paragraph borders, shading, and tabs (Phase 4.0.1)
 * These tests ensure complete round-trip functionality for the fixed stub implementations
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import path from 'path';
import fs from 'fs';

describe('Paragraph Borders, Shading, and Tabs - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Paragraph Borders', () => {
    it('should round-trip paragraph with all borders', async () => {
      // Create document with bordered paragraph
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with all borders');
      para.setBorder({
        top: { style: 'single', size: 4, color: '000000', space: 1 },
        bottom: { style: 'single', size: 4, color: '000000', space: 1 },
        left: { style: 'double', size: 6, color: 'FF0000', space: 2 },
        right: { style: 'double', size: 6, color: 'FF0000', space: 2 }
      });
      doc.addParagraph(para);

      // Save to buffer
      const buffer = await doc.toBuffer();

      // Load from buffer
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      expect(paragraphs).toHaveLength(1);
      const loadedPara = paragraphs[0];
      const formatting = loadedPara?.getFormatting();

      expect(formatting?.borders).toBeDefined();
      expect(formatting?.borders?.top).toEqual({ style: 'single', size: 4, color: '000000', space: 1 });
      expect(formatting?.borders?.bottom).toEqual({ style: 'single', size: 4, color: '000000', space: 1 });
      expect(formatting?.borders?.left).toEqual({ style: 'double', size: 6, color: 'FF0000', space: 2 });
      expect(formatting?.borders?.right).toEqual({ style: 'double', size: 6, color: 'FF0000', space: 2 });
    });

    it('should round-trip paragraph with top and bottom borders only', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with top/bottom borders');
      para.setBorder({
        top: { style: 'thick', size: 8, color: '0000FF' },
        bottom: { style: 'thick', size: 8, color: '0000FF' }
      });
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.borders?.top).toEqual({ style: 'thick', size: 8, color: '0000FF' });
      expect(formatting?.borders?.bottom).toEqual({ style: 'thick', size: 8, color: '0000FF' });
      expect(formatting?.borders?.left).toBeUndefined();
      expect(formatting?.borders?.right).toBeUndefined();
    });

    it('should round-trip paragraph with dashed borders', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with dashed borders');
      para.setBorder({
        top: { style: 'dashed', size: 4, color: '00FF00', space: 1 },
        bottom: { style: 'dotted', size: 4, color: '00FF00', space: 1 }
      });
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.borders?.top?.style).toBe('dashed');
      expect(formatting?.borders?.bottom?.style).toBe('dotted');
    });

    it('should save borders to file and load correctly', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Testing file save/load with borders');
      para.setBorder({
        top: { style: 'single', size: 4, color: 'FF0000', space: 1 },
        left: { style: 'single', size: 4, color: 'FF0000', space: 1 }
      });
      doc.addParagraph(para);

      const filePath = path.join(testOutputDir, 'paragraph-borders.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.borders?.top).toEqual({ style: 'single', size: 4, color: 'FF0000', space: 1 });
      expect(formatting?.borders?.left).toEqual({ style: 'single', size: 4, color: 'FF0000', space: 1 });

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('Paragraph Shading', () => {
    it('should round-trip paragraph with solid shading', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with yellow background');
      para.setShading({ fill: 'FFFF00', val: 'solid' });
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.shading).toBeDefined();
      expect(formatting?.shading?.fill).toBe('FFFF00');
      expect(formatting?.shading?.val).toBe('solid');
    });

    it('should round-trip paragraph with pattern shading', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with diagonal stripe pattern');
      para.setShading({
        fill: 'FFFF00',
        color: '000000',
        val: 'diagStripe'
      });
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.shading?.fill).toBe('FFFF00');
      expect(formatting?.shading?.color).toBe('000000');
      expect(formatting?.shading?.val).toBe('diagStripe');
    });

    it('should round-trip paragraph with horizontal cross pattern', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with cross pattern');
      para.setShading({
        fill: '00FF00',
        color: '0000FF',
        val: 'horzCross'
      });
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.shading?.val).toBe('horzCross');
    });

    it('should save shading to file and load correctly', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Testing file save/load with shading');
      para.setShading({ fill: 'FF00FF', val: 'solid' });
      doc.addParagraph(para);

      const filePath = path.join(testOutputDir, 'paragraph-shading.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.shading?.fill).toBe('FF00FF');

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('Tab Stops', () => {
    it('should round-trip paragraph with multiple tab stops', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with tab stops');
      para.setTabs([
        { position: 720, val: 'left' },
        { position: 1440, val: 'center', leader: 'dot' },
        { position: 2160, val: 'right', leader: 'underscore' }
      ]);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.tabs).toBeDefined();
      expect(formatting?.tabs).toHaveLength(3);
      expect(formatting?.tabs?.[0]).toEqual({ position: 720, val: 'left' });
      expect(formatting?.tabs?.[1]).toEqual({ position: 1440, val: 'center', leader: 'dot' });
      expect(formatting?.tabs?.[2]).toEqual({ position: 2160, val: 'right', leader: 'underscore' });
    });

    it('should round-trip paragraph with decimal tab stop', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with decimal tab');
      para.setTabs([
        { position: 1440, val: 'decimal', leader: 'dot' }
      ]);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.tabs?.[0]?.val).toBe('decimal');
      expect(formatting?.tabs?.[0]?.leader).toBe('dot');
    });

    it('should round-trip paragraph with bar tab stop', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with bar tab');
      para.setTabs([
        { position: 1440, val: 'bar' }
      ]);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.tabs?.[0]?.val).toBe('bar');
    });

    it('should save tabs to file and load correctly', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Testing file save/load with tabs');
      para.setTabs([
        { position: 720, val: 'left', leader: 'dot' },
        { position: 2880, val: 'right', leader: 'hyphen' }
      ]);
      doc.addParagraph(para);

      const filePath = path.join(testOutputDir, 'paragraph-tabs.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();
      expect(formatting?.tabs).toHaveLength(2);
      expect(formatting?.tabs?.[0]).toEqual({ position: 720, val: 'left', leader: 'dot' });
      expect(formatting?.tabs?.[1]).toEqual({ position: 2880, val: 'right', leader: 'hyphen' });

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('Combined Features', () => {
    it('should round-trip paragraph with borders, shading, and tabs', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with all features');
      para.setBorder({
        top: { style: 'single', size: 4, color: '000000' },
        bottom: { style: 'single', size: 4, color: '000000' }
      });
      para.setShading({ fill: 'FFFF00', val: 'solid' });
      para.setTabs([
        { position: 720, val: 'left' },
        { position: 1440, val: 'center' }
      ]);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const formatting = paragraphs[0]?.getFormatting();

      // Check borders
      expect(formatting?.borders?.top).toBeDefined();
      expect(formatting?.borders?.bottom).toBeDefined();

      // Check shading
      expect(formatting?.shading?.fill).toBe('FFFF00');

      // Check tabs
      expect(formatting?.tabs).toHaveLength(2);
    });

    it('should save complete formatted document and load correctly', async () => {
      const doc = Document.create();

      // Paragraph 1: Borders only
      const para1 = new Paragraph();
      para1.addText('Paragraph 1: With borders');
      para1.setBorder({
        top: { style: 'double', size: 8, color: 'FF0000' },
        bottom: { style: 'double', size: 8, color: 'FF0000' }
      });
      doc.addParagraph(para1);

      // Paragraph 2: Shading only
      const para2 = new Paragraph();
      para2.addText('Paragraph 2: With shading');
      para2.setShading({ fill: '00FF00', val: 'solid' });
      doc.addParagraph(para2);

      // Paragraph 3: Tabs only
      const para3 = new Paragraph();
      para3.addText('Paragraph 3: With tabs');
      para3.setTabs([{ position: 1440, val: 'center', leader: 'dot' }]);
      doc.addParagraph(para3);

      // Paragraph 4: Everything
      const para4 = new Paragraph();
      para4.addText('Paragraph 4: With everything');
      para4.setBorder({
        left: { style: 'single', size: 4, color: '0000FF' }
      });
      para4.setShading({ fill: 'FFFF00', val: 'solid' });
      para4.setTabs([{ position: 720, val: 'left' }]);
      doc.addParagraph(para4);

      const filePath = path.join(testOutputDir, 'paragraph-combined.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const paragraphs = loadedDoc.getParagraphs();

      expect(paragraphs).toHaveLength(4);

      // Verify paragraph 1
      expect(paragraphs[0]?.getFormatting().borders?.top).toBeDefined();

      // Verify paragraph 2
      expect(paragraphs[1]?.getFormatting().shading?.fill).toBe('00FF00');

      // Verify paragraph 3
      expect(paragraphs[2]?.getFormatting().tabs).toHaveLength(1);

      // Verify paragraph 4
      expect(paragraphs[3]?.getFormatting().borders?.left).toBeDefined();
      expect(paragraphs[3]?.getFormatting().shading?.fill).toBe('FFFF00');
      expect(paragraphs[3]?.getFormatting().tabs).toHaveLength(1);

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });
});
